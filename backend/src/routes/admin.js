import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { authMiddleware, parsePrincipal } from '../auth.js'

function normalizePhoneDigits(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  return d.length >= 8 ? d : ''
}

const router = Router()
router.use(authMiddleware('ADMIN'))

function roomOccupiedCount(roomId) {
  const row = db
    .prepare('SELECT COUNT(*) as c FROM room_allocation WHERE room_id = ? AND active = 1')
    .get(roomId)
  return row?.c ?? 0
}

function roomLabel(studentId) {
  const row = db
    .prepare(
      `SELECT r.block_code, r.room_number FROM room_allocation a
       JOIN rooms r ON r.id = a.room_id
       WHERE a.student_id = ? AND a.active = 1`,
    )
    .get(studentId)
  if (!row) return '-'
  return `${row.block_code}-${row.room_number}`
}

router.get('/dashboard', (req, res) => {
  const totalStudents = db.prepare('SELECT COUNT(*) as c FROM students').get().c
  const rooms = db.prepare('SELECT * FROM rooms').all()
  const totalRooms = rooms.length
  let availableRooms = 0
  for (const r of rooms) {
    if (r.status === 'MAINTENANCE') continue
    const occ = roomOccupiedCount(r.id)
    if (occ < r.capacity) availableRooms++
  }
  const totalComplaints = db.prepare('SELECT COUNT(*) as c FROM complaints').get().c
  const pendingComplaints = db
    .prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'PENDING'")
    .get().c

  const today = new Date().toISOString().slice(0, 10)
  const todayRows = db.prepare('SELECT * FROM attendance WHERE attendance_date = ?').all(today)
  const presentToday = todayRows.filter((a) => a.status === 'PRESENT').length
  const absentToday = todayRows.filter((a) => a.status === 'ABSENT').length
  const allocated = db.prepare('SELECT COUNT(*) as c FROM room_allocation WHERE active = 1').get().c
  const notMarkedToday = Math.max(0, allocated - todayRows.length)

  res.json({
    totalStudents,
    totalRooms,
    availableRooms,
    totalComplaints,
    pendingComplaints,
    attendanceOverview: {
      presentToday,
      absentToday,
      notMarkedToday,
    },
  })
})

router.get('/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms').all()
  const out = rooms.map((room) => {
    const occ = roomOccupiedCount(room.id)
    let availabilityLabel = 'AVAILABLE'
    if (room.status === 'MAINTENANCE') availabilityLabel = 'MAINTENANCE'
    else if (occ >= room.capacity) availabilityLabel = 'FULL'
    return {
      id: room.id,
      blockCode: room.block_code,
      roomNumber: room.room_number,
      capacity: room.capacity,
      occupiedCount: occ,
      roomStatus: room.status,
      availabilityLabel,
    }
  })
  res.json(out)
})

router.post('/rooms', (req, res) => {
  const { blockCode, roomNumber, capacity } = req.body || {}
  if (!blockCode || !roomNumber || !capacity) {
    return res.status(400).json({ message: 'blockCode, roomNumber, and capacity are required' })
  }
  const bc = String(blockCode).trim().toUpperCase()
  const rn = Number(roomNumber)
  const cap = Number(capacity)
  if (isNaN(rn) || rn <= 0 || isNaN(cap) || cap <= 0) {
    return res.status(400).json({ message: 'roomNumber and capacity must be positive numbers' })
  }
  // Check if room already exists
  const existing = db.prepare('SELECT id FROM rooms WHERE block_code = ? AND room_number = ?').get(bc, rn)
  if (existing) {
    return res.status(409).json({ message: 'Room already exists' })
  }
  const ins = db.prepare('INSERT INTO rooms (block_code, room_number, capacity, status) VALUES (?, ?, ?, ?)').run(bc, rn, cap, 'AVAILABLE')
  res.status(201).json({ id: ins.lastInsertRowid, blockCode: bc, roomNumber: rn, capacity: cap })
})

router.get('/rooms/:roomId/students', (req, res) => {
  const roomId = Number(req.params.roomId)
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId)
  if (!room) return res.status(400).json({ message: 'Room not found' })
  const list = db
    .prepare(
      `SELECT s.id, s.name, s.register_number as registerNumber
       FROM room_allocation a JOIN students s ON s.id = a.student_id
       WHERE a.room_id = ? AND a.active = 1`,
    )
    .all(roomId)
  res.json(list)
})

/** Remove one student from this room (ends active allocation). */
router.delete('/rooms/:roomId/students/:studentId', (req, res) => {
  const roomId = Number(req.params.roomId)
  const studentId = Number(req.params.studentId)
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId)
  if (!room) return res.status(400).json({ message: 'Room not found' })
  const alloc = db
    .prepare(
      'SELECT * FROM room_allocation WHERE room_id = ? AND student_id = ? AND active = 1',
    )
    .get(roomId, studentId)
  if (!alloc) {
    return res.status(404).json({ message: 'This student is not assigned to this room' })
  }
  const today = new Date().toISOString().slice(0, 10)
  db.prepare('UPDATE room_allocation SET active = 0, check_out_date = ? WHERE id = ?').run(
    today,
    alloc.id,
  )
  res.sendStatus(200)
})

/**
 * Create student if register number is new, then assign to this room.
 * Default login: register number + password "student123" (if newly created).
 */
router.post('/rooms/:roomId/students/quick-add', (req, res) => {
  const roomId = Number(req.params.roomId)
  const { registerNumber, name, department, studentPhone, parentPhone, gender } = req.body || {}
  const reg = String(registerNumber || '').trim()
  const nm = String(name || '').trim()
  if (!reg || !nm) {
    return res.status(400).json({ message: 'Register number and name are required' })
  }

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId)
  if (!room) return res.status(400).json({ message: 'Room not found' })
  if (room.status === 'MAINTENANCE') {
    return res.status(409).json({ message: 'Room is under maintenance' })
  }
  if (roomOccupiedCount(roomId) >= room.capacity) {
    return res.status(409).json({ message: 'Room is full' })
  }

  let student = db.prepare('SELECT * FROM students WHERE register_number = ?').get(reg)
  let created = false

  if (!student) {
    const dept = String(department || '').trim() || 'Not set'
    const sp = normalizePhoneDigits(studentPhone) || '0000000000'
    const pp = normalizePhoneDigits(parentPhone) || '0000000000'
    const gnd = String(gender || '').trim() || null
    const hash = bcrypt.hashSync('student123', 10)
    const ins = db
      .prepare(
        `INSERT INTO students (name, department, register_number, student_phone, parent_phone, gender, password_hash)
         VALUES (?,?,?,?,?,?,?)`,
      )
      .run(nm, dept, reg, sp, pp, gnd, hash)
    student = db.prepare('SELECT * FROM students WHERE id = ?').get(ins.lastInsertRowid)
    created = true
  } else {
    const inThis = db
      .prepare(
        'SELECT id FROM room_allocation WHERE student_id = ? AND room_id = ? AND active = 1',
      )
      .get(student.id, roomId)
    if (inThis) {
      return res.status(409).json({ message: 'This student is already in this room' })
    }
  }

  const existingAlloc = db
    .prepare('SELECT * FROM room_allocation WHERE student_id = ? AND active = 1')
    .get(student.id)
  if (existingAlloc) {
    const today = new Date().toISOString().slice(0, 10)
    db.prepare('UPDATE room_allocation SET active = 0, check_out_date = ? WHERE id = ?').run(
      today,
      existingAlloc.id,
    )
  }
  const checkIn = new Date().toISOString().slice(0, 10)
  db.prepare(
    `INSERT INTO room_allocation (student_id, room_id, check_in_date, active) VALUES (?,?,?,1)`,
  ).run(student.id, roomId, checkIn)

  return res.status(201).json({
    id: student.id,
    name: student.name,
    registerNumber: student.register_number,
    created,
  })
})

router.get('/students', (req, res) => {
  const list = db
    .prepare('SELECT id, name, register_number as registerNumber FROM students ORDER BY name')
    .all()
  res.json(list)
})

router.get('/students/:studentId', (req, res) => {
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(req.params.studentId))
  if (!s) return res.status(400).json({ message: 'Student not found' })
  res.json({
    id: s.id,
    name: s.name,
    department: s.department,
    registerNumber: s.register_number,
    studentContact: s.student_phone,
    parentContact: s.parent_phone,
    gender: s.gender,
  })
})

router.put('/students/:studentId', (req, res) => {
  const sid = Number(req.params.studentId)
  const { name, department, registerNumber, studentContact, parentContact, gender } = req.body || {}
  
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(sid)
  if (!student) return res.status(404).json({ message: 'Student not found' })

  if (!name?.trim() || !registerNumber?.trim()) {
    return res.status(400).json({ message: 'Name and Register number are required' })
  }

  const existing = db.prepare('SELECT id FROM students WHERE register_number = ? AND id != ?').get(registerNumber.trim(), sid)
  if (existing) {
    return res.status(409).json({ message: 'Register number already exists' })
  }

  db.prepare(`
    UPDATE students 
    SET name = ?, department = ?, register_number = ?, student_phone = ?, parent_phone = ?, gender = ?
    WHERE id = ?
  `).run(
    name.trim(),
    department?.trim() || '',
    registerNumber.trim(),
    studentContact ? normalizePhoneDigits(studentContact) : '',
    parentContact ? normalizePhoneDigits(parentContact) : '',
    gender?.trim() || null,
    sid
  )

  res.sendStatus(200)
})

router.post('/allocations', (req, res) => {
  const { studentId, roomId, checkInDate } = req.body || {}
  if (!studentId || !roomId) {
    return res.status(400).json({ message: 'studentId and roomId required' })
  }
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(Number(roomId))
  if (!room) return res.status(400).json({ message: 'Room not found' })
  if (room.status === 'MAINTENANCE') {
    return res.status(409).json({ message: 'Room is under maintenance' })
  }
  const occ = roomOccupiedCount(room.id)
  if (occ >= room.capacity) return res.status(409).json({ message: 'Room is full' })

  const sid = Number(studentId)
  const existing = db.prepare('SELECT * FROM room_allocation WHERE student_id = ? AND active = 1').get(sid)
  if (existing) {
    const today = new Date().toISOString().slice(0, 10)
    db.prepare('UPDATE room_allocation SET active = 0, check_out_date = ? WHERE id = ?').run(
      today,
      existing.id,
    )
  }
  const checkIn = checkInDate || new Date().toISOString().slice(0, 10)
  db.prepare(
    `INSERT INTO room_allocation (student_id, room_id, check_in_date, active) VALUES (?,?,?,1)`,
  ).run(sid, Number(roomId), checkIn)
  res.sendStatus(200)
})

router.post('/attendance', (req, res) => {
  const { date, entries } = req.body || {}
  if (!date || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ message: 'date and entries required' })
  }
  for (const e of entries) {
    if (!e.studentId || !e.status) continue
    const exists = db
      .prepare('SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?')
      .get(e.studentId, date)
    if (exists) {
      db.prepare('UPDATE attendance SET status = ?, remarks = ? WHERE id = ?').run(
        e.status,
        e.remarks || null,
        exists.id,
      )
    } else {
      db.prepare(
        `INSERT INTO attendance (student_id, attendance_date, status, remarks) VALUES (?,?,?,?)`,
      ).run(e.studentId, date, e.status, e.remarks || null)
    }
  }
  res.sendStatus(200)
})

router.get('/attendance', (req, res) => {
  const { date, studentId } = req.query
  let rows
  if (studentId) {
    const sid = Number(studentId)
    if (date) {
      rows = db
        .prepare(
          `SELECT a.*, s.name as student_name, s.register_number
           FROM attendance a JOIN students s ON s.id = a.student_id
           WHERE a.student_id = ? AND a.attendance_date = ?`,
        )
        .all(sid, date)
    } else {
      rows = db
        .prepare(
          `SELECT a.*, s.name as student_name, s.register_number
           FROM attendance a JOIN students s ON s.id = a.student_id
           WHERE a.student_id = ?`,
        )
        .all(sid)
    }
  } else if (date) {
    rows = db
      .prepare(
        `SELECT a.*, s.name as student_name, s.register_number
         FROM attendance a JOIN students s ON s.id = a.student_id
         WHERE a.attendance_date = ?`,
      )
      .all(date)
  } else {
    rows = db
      .prepare(
        `SELECT a.*, s.name as student_name, s.register_number
         FROM attendance a JOIN students s ON s.id = a.student_id`,
      )
      .all()
  }

  const out = rows.map((a) => ({
    id: a.id,
    studentId: a.student_id,
    studentName: a.student_name,
    registerNumber: a.register_number,
    roomLabel: roomLabel(a.student_id),
    date: a.attendance_date,
    status: a.status,
    remarks: a.remarks,
  }))
  res.json(out)
})

router.get('/complaints', (req, res) => {
  const list = db
    .prepare(
      `SELECT c.*, s.name as student_name, s.department as student_department, s.register_number
       FROM complaints c JOIN students s ON s.id = c.student_id
       ORDER BY c.created_at DESC`,
    )
    .all()
  res.json(
    list.map((c) => ({
      id: c.id,
      studentId: c.student_id,
      studentName: c.student_name,
      studentDepartment: c.student_department,
      registerNumber: c.register_number,
      description: c.description,
      status: c.status,
      adminProof: c.admin_proof,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  )
})

router.patch('/complaints/:id', (req, res) => {
  const { status, adminProof } = req.body || {}
  if (!status) return res.status(400).json({ message: 'status required' })
  const id = Number(req.params.id)
  const c = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id)
  if (!c) return res.status(400).json({ message: 'Complaint not found' })
  const now = new Date().toISOString()
  db.prepare('UPDATE complaints SET status = ?, admin_proof = ?, updated_at = ? WHERE id = ?').run(
    status,
    adminProof || null,
    now,
    id,
  )
  const row = db
    .prepare(
      `SELECT c.*, s.name as student_name, s.department as student_department, s.register_number
       FROM complaints c JOIN students s ON s.id = c.student_id WHERE c.id = ?`,
    )
    .get(id)
  res.json({
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentDepartment: row.student_department,
    registerNumber: row.register_number,
    description: row.description,
    status: row.status,
    adminProof: row.admin_proof,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
})

router.post('/notifications', (req, res) => {
  const p = parsePrincipal(req.auth.sub)
  if (!p || p.type !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  const { title, message } = req.body || {}
  if (!title?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'title and message required' })
  }
  const r = db
    .prepare('INSERT INTO notifications (admin_id, title, message) VALUES (?,?,?)')
    .run(p.id, title.trim(), message.trim())
  const n = db.prepare('SELECT * FROM notifications WHERE id = ?').get(r.lastInsertRowid)
  res.json({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.created_at,
  })
})

router.get('/vacating', (req, res) => {
  const list = db
    .prepare(
      `SELECT v.*, s.name as student_name, s.register_number
       FROM vacating_requests v JOIN students s ON s.id = v.student_id
       ORDER BY v.vacate_date DESC`,
    )
    .all()
  res.json(
    list.map((v) => ({
      id: v.id,
      studentId: v.student_id,
      studentName: v.student_name,
      registerNumber: v.register_number,
      vacateDate: v.vacate_date,
      academicYear: v.academic_year,
      notes: v.notes,
      createdAt: v.created_at,
    })),
  )
})

router.post('/vacating', (req, res) => {
  const { studentId, vacateDate, academicYear, notes } = req.body || {}
  if (!studentId || !vacateDate || !academicYear?.trim()) {
    return res.status(400).json({ message: 'studentId, vacateDate, academicYear required' })
  }
  const sid = Number(studentId)
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(sid)
  if (!s) return res.status(400).json({ message: 'Student not found' })
  const existing = db.prepare('SELECT * FROM room_allocation WHERE student_id = ? AND active = 1').get(sid)
  if (existing) {
    db.prepare('UPDATE room_allocation SET active = 0, check_out_date = ? WHERE id = ?').run(
      vacateDate,
      existing.id,
    )
  }
  const r = db
    .prepare(
      `INSERT INTO vacating_requests (student_id, vacate_date, academic_year, notes) VALUES (?,?,?,?)`,
    )
    .run(sid, vacateDate, academicYear.trim(), notes || null)
  const v = db.prepare('SELECT * FROM vacating_requests WHERE id = ?').get(r.lastInsertRowid)
  res.json({
    id: v.id,
    studentId: sid,
    studentName: s.name,
    registerNumber: s.register_number,
    vacateDate: v.vacate_date,
    academicYear: v.academic_year,
    notes: v.notes,
    createdAt: v.created_at,
  })
})

router.get('/mess-menu', (req, res) => {
  const menu = db.prepare('SELECT * FROM mess_menu ORDER BY day, meal_time').all()
  res.json(menu)
})

router.post('/mess-menu', (req, res) => {
  const { day, mealTime, dish } = req.body || {}
  if (!day || !mealTime || !dish) {
    return res.status(400).json({ message: 'day, mealTime, and dish required' })
  }
  
  const existing = db.prepare('SELECT id FROM mess_menu WHERE day = ? AND meal_time = ?').get(day, mealTime)
  if (existing) {
    db.prepare('UPDATE mess_menu SET dish = ? WHERE id = ?').run(dish, existing.id)
  } else {
    db.prepare('INSERT INTO mess_menu (day, meal_time, dish) VALUES (?,?,?)').run(day, mealTime, dish)
  }
  res.sendStatus(200)
})

router.get('/outpasses', (req, res) => {
  const list = db.prepare(`
    SELECT o.*, s.name as student_name, s.register_number as register_number, s.parent_phone as parent_phone
    FROM outpass_requests o
    JOIN students s ON s.id = o.student_id
    ORDER BY o.created_at DESC
  `).all()
  res.json(list.map(r => ({
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name,
    registerNumber: r.register_number,
    parentPhone: r.parent_phone,
    reason: r.reason,
    outDate: r.out_date,
    inDate: r.in_date,
    status: r.status,
    createdAt: r.created_at
  })))
})

router.post('/outpasses/:id/ask-parent', (req, res) => {
  const id = Number(req.params.id)
  const outpass = db.prepare('SELECT * FROM outpass_requests WHERE id = ?').get(id)
  if (!outpass) return res.status(404).json({ message: 'Outpass request not found' })
  db.prepare("UPDATE outpass_requests SET status = 'AWAITING_PARENT' WHERE id = ?").run(id)
  res.sendStatus(200)
})

router.post('/outpasses/:id/approve', (req, res) => {
  const id = Number(req.params.id)
  const outpass = db.prepare('SELECT * FROM outpass_requests WHERE id = ?').get(id)
  if (!outpass) return res.status(404).json({ message: 'Outpass request not found' })
  db.prepare("UPDATE outpass_requests SET status = 'APPROVED' WHERE id = ?").run(id)
  res.sendStatus(200)
})

router.post('/outpasses/:id/reject', (req, res) => {
  const id = Number(req.params.id)
  const outpass = db.prepare('SELECT * FROM outpass_requests WHERE id = ?').get(id)
  if (!outpass) return res.status(404).json({ message: 'Outpass request not found' })
  db.prepare("UPDATE outpass_requests SET status = 'REJECTED' WHERE id = ?").run(id)
  res.sendStatus(200)
})

export default router
