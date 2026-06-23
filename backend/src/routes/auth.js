import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { signToken } from '../auth.js'
import { sendOtpSms, smsConfigured } from '../sms.js'

const router = Router()

function normalizePhone(raw) {
  return String(raw || '').replace(/\D/g, '')
}

const PURPOSE_REGISTER = 'REGISTER'
const PURPOSE_LOGIN = 'LOGIN'

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username?.trim() || !password) {
    return res.status(400).json({ message: 'Username and password required' })
  }
  const row = db.prepare('SELECT * FROM admins WHERE username = ?').get(username.trim())
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }
  const token = signToken(`admin:${row.id}`, 'ADMIN')
  return res.json({ token, role: 'ADMIN', displayName: row.name })
})

router.post('/student/send-otp', async (req, res) => {
  const { phone, purpose } = req.body || {}
  if (!phone || !purpose || ![PURPOSE_REGISTER, PURPOSE_LOGIN].includes(purpose)) {
    return res.status(400).json({ message: 'phone and purpose (REGISTER|LOGIN) required' })
  }
  const normalized = normalizePhone(phone)
  if (normalized.length < 8) {
    return res.status(400).json({ message: 'Enter a valid phone number' })
  }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  db.prepare(
    'INSERT INTO registration_otps (phone, code, expires_at, purpose) VALUES (?,?,?,?)',
  ).run(normalized, code, expires, purpose)

  let smsSent = false
  if (smsConfigured()) {
    try {
      await sendOtpSms(normalized, code)
      smsSent = true
    } catch (e) {
      console.error(e)
      return res.status(400).json({ message: `Could not send SMS: ${e.message}` })
    }
  }

  const devReveal = (process.env.OTP_DEV_REVEAL || 'true').toLowerCase() === 'true'
  let dev = null
  let message
  if (smsSent) {
    message = 'OTP sent to your phone by SMS.'
  } else if (devReveal) {
    dev = code
    message =
      'SMS is not configured (set Twilio env vars). Use the code below for testing.'
  } else {
    message =
      'OTP was created server-side. Configure Twilio or set OTP_DEV_REVEAL=true for local testing.'
  }
  return res.json({ message, devOtp: dev })
})

router.post('/student/register', (req, res) => {
  const b = req.body || {}
  const {
    phone,
    otp,
    name,
    department,
    registerNumber,
    studentContact,
    parentContact,
    gender,
    password,
  } = b
  if (!phone || !otp || !name || !department || !registerNumber || !studentContact || !parentContact || !password) {
    return res.status(400).json({ message: 'All fields required' })
  }
  const otpPhone = normalizePhone(phone)
  const contact = normalizePhone(studentContact)
  if (otpPhone !== contact) {
    return res.status(400).json({ message: 'Student contact number must match the phone used for OTP' })
  }
  const rows = db
    .prepare(
      'SELECT * FROM registration_otps WHERE phone = ? AND purpose = ? ORDER BY id DESC',
    )
    .all(otpPhone, PURPOSE_REGISTER)
  const latest = rows[0]
  const now = new Date().toISOString()
  if (!latest || new Date(latest.expires_at) < new Date(now) || latest.code !== String(otp).trim()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }
  db.prepare('DELETE FROM registration_otps WHERE phone = ? AND purpose = ?').run(otpPhone, PURPOSE_REGISTER)

  if (db.prepare('SELECT id FROM students WHERE register_number = ?').get(registerNumber.trim())) {
    return res.status(409).json({ message: 'Register number already exists' })
  }
  if (db.prepare('SELECT id FROM students WHERE student_phone = ?').get(contact)) {
    return res.status(409).json({ message: 'An account already exists for this phone number' })
  }

  const hash = bcrypt.hashSync(password, 10)
  db.prepare(
    `INSERT INTO students (name, department, register_number, student_phone, parent_phone, gender, password_hash)
     VALUES (?,?,?,?,?,?,?)`
  ).run(
    name.trim(),
    department.trim(),
    registerNumber.trim(),
    contact,
    normalizePhone(parentContact),
    gender?.trim() || null,
    hash,
  )
  return res.sendStatus(200)
})

router.post('/student/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username?.trim() || !password) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }
  const row = db.prepare('SELECT * FROM students WHERE register_number = ?').get(username.trim())
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(400).json({ message: 'Invalid credentials' })
  }
  const token = signToken(`student:${row.id}`, 'STUDENT')
  return res.json({ token, role: 'STUDENT', displayName: row.name })
})

router.post('/student/login-otp', (req, res) => {
  const { phone, otp } = req.body || {}
  if (!phone || !otp) {
    return res.status(400).json({ message: 'phone and otp required' })
  }
  const normalized = normalizePhone(phone)
  const rows = db
    .prepare(
      'SELECT * FROM registration_otps WHERE phone = ? AND purpose = ? ORDER BY id DESC',
    )
    .all(normalized, PURPOSE_LOGIN)
  const latest = rows[0]
  const now = new Date().toISOString()
  if (!latest || new Date(latest.expires_at) < new Date(now) || latest.code !== String(otp).trim()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }
  db.prepare('DELETE FROM registration_otps WHERE phone = ? AND purpose = ?').run(normalized, PURPOSE_LOGIN)

  const row = db.prepare('SELECT * FROM students WHERE student_phone = ?').get(normalized)
  if (!row) {
    return res.status(400).json({ message: 'No student account for this phone' })
  }
  const token = signToken(`student:${row.id}`, 'STUDENT')
  return res.json({ token, role: 'STUDENT', displayName: row.name })
})

router.post('/parent/login', (req, res) => {
  const { registerNumber, parentPhone } = req.body || {}
  if (!registerNumber?.trim() || !parentPhone) {
    return res.status(400).json({ message: 'Student Register number and Parent Phone number are required' })
  }
  const student = db.prepare('SELECT * FROM students WHERE register_number = ?').get(registerNumber.trim())
  if (!student) {
    return res.status(400).json({ message: 'Student Register number not found' })
  }
  const normInput = normalizePhone(parentPhone)
  const normDb = normalizePhone(student.parent_phone)
  if (normInput !== normDb) {
    return res.status(400).json({ message: 'Invalid parent contact details for this student' })
  }
  const token = signToken(`parent:${student.id}`, 'PARENT')
  return res.json({ token, role: 'PARENT', displayName: `Parent of ${student.name}` })
})

export default router
