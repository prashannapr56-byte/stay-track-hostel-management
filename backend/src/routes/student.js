import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, parsePrincipal } from '../auth.js'

const router = Router()
router.use(authMiddleware('STUDENT'))

function studentIdFromReq(req) {
  const p = parsePrincipal(req.auth.sub)
  return p?.type === 'student' ? p.id : null
}

router.get('/dashboard', (req, res) => {
  const sid = studentIdFromReq(req)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(sid)
  if (!s) return res.status(404).json({ message: 'Not found' })

  const profile = {
    id: s.id,
    name: s.name,
    department: s.department,
    registerNumber: s.register_number,
    studentContact: s.student_phone,
    parentContact: s.parent_phone,
    gender: s.gender,
  }

  const alloc = db
    .prepare(
      `SELECT a.check_in_date, r.block_code, r.room_number
       FROM room_allocation a JOIN rooms r ON r.id = a.room_id
       WHERE a.student_id = ? AND a.active = 1`,
    )
    .get(sid)
  const room = alloc
    ? {
        blockCode: alloc.block_code,
        roomNumber: alloc.room_number,
        checkInDate: alloc.check_in_date,
      }
    : null

  const complaints = db
    .prepare(
      'SELECT id, description, status, admin_proof as adminProof, created_at as createdAt FROM complaints WHERE student_id = ? ORDER BY created_at DESC',
    )
    .all(sid)

  const notifications = db
    .prepare(
      'SELECT id, title, message, created_at as createdAt FROM notifications ORDER BY created_at DESC LIMIT 20',
    )
    .all()

  const marks = db.prepare('SELECT status, attendance_date FROM attendance WHERE student_id = ? ORDER BY attendance_date ASC').all(sid)
  const total = marks.length
  const present = marks.filter((m) => m.status === 'PRESENT').length
  const percentPresent = total === 0 ? 0 : Math.round((100 * present) / total)

  const historyDisplay = marks.slice(-14).map(m => ({
    date: m.attendance_date,
    status: m.status,
    value: m.status === 'PRESENT' ? 1 : 0
  }))

  res.json({
    profile,
    room,
    complaints,
    notifications,
    attendance: {
      percentPresent,
      totalDaysMarked: total,
      history: historyDisplay
    },
  })
})

router.post('/complaints', (req, res) => {
  const sid = studentIdFromReq(req)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const { description } = req.body || {}
  if (!description?.trim()) return res.status(400).json({ message: 'description required' })
  const now = new Date().toISOString()
  const r = db
    .prepare(
      'INSERT INTO complaints (student_id, description, status, created_at, updated_at) VALUES (?,?,?,?,?)',
    )
    .run(sid, description.trim(), 'PENDING', now, now)
  const c = db.prepare('SELECT * FROM complaints WHERE id = ?').get(r.lastInsertRowid)
  res.json({
    id: c.id,
    description: c.description,
    status: c.status,
    adminProof: c.admin_proof,
    createdAt: c.created_at,
  })
})

router.get('/notifications', (req, res) => {
  const list = db
    .prepare('SELECT id, title, message, created_at as createdAt FROM notifications ORDER BY created_at DESC')
    .all()
  res.json(list)
})

router.get('/mess-menu/today', (req, res) => {
  const sid = studentIdFromReq(req)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = days[new Date().getDay()]
  const menu = db.prepare('SELECT * FROM mess_menu WHERE day = ? ORDER BY meal_time').all(todayName)
  res.json(menu)
})

router.get('/outpasses', (req, res) => {
  const sid = studentIdFromReq(req)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const list = db.prepare('SELECT * FROM outpass_requests WHERE student_id = ? ORDER BY created_at DESC').all(sid)
  res.json(list)
})

router.post('/outpasses', (req, res) => {
  const sid = studentIdFromReq(req)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const { reason, outDate, inDate } = req.body || {}
  if (!reason?.trim() || !outDate || !inDate) {
    return res.status(400).json({ message: 'reason, outDate, and inDate are required' })
  }

  // Determine if outDate falls on Friday (5), Saturday (6), or Sunday (0)
  const dateObj = new Date(outDate)
  const day = dateObj.getDay()
  const isWeekend = (day === 0 || day === 5 || day === 6)
  
  // Weekend outpasses automatically go to parent approval, weekday/emergency go to admin review
  const status = isWeekend ? 'AWAITING_PARENT' : 'PENDING'

  db.prepare('INSERT INTO outpass_requests (student_id, reason, out_date, in_date, status) VALUES (?,?,?,?,?)')
    .run(sid, reason.trim(), outDate, inDate, status)
  res.sendStatus(201)
})

export default router
