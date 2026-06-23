import bcrypt from 'bcryptjs'
import { db } from './db.js'

export function runSeed() {
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c
  if (adminCount === 0) {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare(
      'INSERT INTO admins (username, password_hash, name) VALUES (?,?,?)',
    ).run('admin', hash, 'Hostel Administrator')
  }

  if (db.prepare('SELECT COUNT(*) as c FROM rooms').get().c === 0) {
    const ins = db.prepare(
      'INSERT INTO rooms (block_code, room_number, capacity, status) VALUES (?,?,?,?)',
    )
    for (let i = 101; i <= 104; i++) ins.run('A', String(i), 4, 'AVAILABLE')
    for (let i = 201; i <= 203; i++) {
      ins.run('B', String(i), 4, i === 202 ? 'MAINTENANCE' : 'AVAILABLE')
    }
  }

  let demo = db.prepare('SELECT * FROM students WHERE register_number = ?').get('23CS001')
  if (!demo) {
    const hash = bcrypt.hashSync('student123', 10)
    const r = db
      .prepare(
        `INSERT INTO students (name, department, register_number, student_phone, parent_phone, password_hash)
         VALUES (?,?,?,?,?,?)`,
      )
      .run('Priya Sharma', 'Computer Science', '23CS001', '9876543210', '9876500000', hash)
    demo = db.prepare('SELECT * FROM students WHERE id = ?').get(r.lastInsertRowid)
  }

  const r101 = db.prepare("SELECT id FROM rooms WHERE block_code='A' AND room_number='101'").get()
  if (r101 && demo) {
    const existing = db
      .prepare('SELECT id FROM room_allocation WHERE student_id = ? AND active = 1')
      .get(demo.id)
    if (!existing) {
      const checkIn = db.prepare("SELECT date('now','-6 months') as d").get().d
      db.prepare(
        `INSERT INTO room_allocation (student_id, room_id, check_in_date, active) VALUES (?,?,?,1)`,
      ).run(demo.id, r101.id, checkIn)
    }
  }

  if (demo && db.prepare('SELECT COUNT(*) as c FROM complaints').get().c === 0) {
    db.prepare(
      'INSERT INTO complaints (student_id, description, status) VALUES (?,?,?)',
    ).run(demo.id, 'AC not cooling properly in Block A', 'PENDING')
  }

  let past = db.prepare('SELECT * FROM students WHERE register_number = ?').get('21ME055')
  if (!past) {
    const hash = bcrypt.hashSync('unused000', 10)
    const r = db
      .prepare(
        `INSERT INTO students (name, department, register_number, student_phone, parent_phone, password_hash)
         VALUES (?,?,?,?,?,?)`,
      )
      .run('Rahul Verma', 'Mechanical', '21ME055', '9123456789', '9123400000', hash)
    past = db.prepare('SELECT * FROM students WHERE id = ?').get(r.lastInsertRowid)
  }

  if (past && db.prepare('SELECT COUNT(*) as c FROM vacating_requests').get().c === 0) {
    const vacateDate = db.prepare("SELECT date('now','-3 months') as d").get().d
    db.prepare(
      `INSERT INTO vacating_requests (student_id, vacate_date, academic_year, notes)
       VALUES (?,?,?,?)`,
    ).run(past.id, vacateDate, '2024-25', 'Graduated — hostel vacated')
  }
}
