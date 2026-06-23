import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, parsePrincipal } from '../auth.js'

const router = Router()
router.use(authMiddleware('PARENT'))

function studentIdFromReq(req) {
  const p = parsePrincipal(req.auth.sub)
  return p?.type === 'parent' ? p.id : null
}

router.get('/dashboard', (req, res) => {
  const sid = studentIdFromReq(req)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const s = db.prepare('SELECT * FROM students WHERE id = ?').get(sid)
  if (!s) return res.status(404).json({ message: 'Student not found' })
  
  const alloc = db
    .prepare(
      `SELECT a.check_in_date, r.block_code, r.room_number
       FROM room_allocation a JOIN rooms r ON r.id = a.room_id
       WHERE a.student_id = ? AND a.active = 1`,
    )
    .get(sid)
  
  const roomLabel = alloc ? `${alloc.block_code}-${alloc.room_number}` : 'No Room Allocated'

  const outpasses = db
    .prepare('SELECT * FROM outpass_requests WHERE student_id = ? ORDER BY created_at DESC')
    .all(sid)

  res.json({
    studentName: s.name,
    registerNumber: s.register_number,
    parentPhone: s.parent_phone,
    studentPhone: s.student_phone,
    department: s.department,
    gender: s.gender || 'Not specified',
    roomLabel,
    outpasses
  })
})

router.post('/outpasses/:id/approve', (req, res) => {
  const sid = studentIdFromReq(req)
  const id = Number(req.params.id)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const outpass = db.prepare('SELECT * FROM outpass_requests WHERE id = ?').get(id)
  if (!outpass || outpass.student_id !== sid) {
    return res.status(404).json({ message: 'Outpass request not found' })
  }
  db.prepare("UPDATE outpass_requests SET status = 'APPROVED' WHERE id = ?").run(id)
  res.sendStatus(200)
})

router.post('/outpasses/:id/reject', (req, res) => {
  const sid = studentIdFromReq(req)
  const id = Number(req.params.id)
  if (!sid) return res.status(403).json({ message: 'Forbidden' })
  const outpass = db.prepare('SELECT * FROM outpass_requests WHERE id = ?').get(id)
  if (!outpass || outpass.student_id !== sid) {
    return res.status(404).json({ message: 'Outpass request not found' })
  }
  db.prepare("UPDATE outpass_requests SET status = 'REJECTED' WHERE id = ?").run(id)
  res.sendStatus(200)
})

export default router
