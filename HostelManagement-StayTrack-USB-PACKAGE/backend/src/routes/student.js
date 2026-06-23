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
      'SELECT id, description, status, created_at as createdAt FROM complaints WHERE student_id = ? ORDER BY created_at DESC',
    )
    .all(sid)

  const notifications = db
    .prepare(
      'SELECT id, title, message, created_at as createdAt FROM notifications ORDER BY created_at DESC LIMIT 20',
    )
    .all()

  const marks = db.prepare('SELECT status FROM attendance WHERE student_id = ?').all(sid)
  const total = marks.length
  const present = marks.filter((m) => m.status === 'PRESENT').length
  const percentPresent = total === 0 ? 0 : Math.round((100 * present) / total)

  res.json({
    profile,
    room,
    complaints,
    notifications,
    attendance: {
      percentPresent,
      totalDaysMarked: total,
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
    createdAt: c.created_at,
  })
})

router.get('/notifications', (req, res) => {
  const list = db
    .prepare('SELECT id, title, message, created_at as createdAt FROM notifications ORDER BY created_at DESC')
    .all()
  res.json(list)
})

export default router
