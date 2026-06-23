import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'StayTrackHostelManagementSecretKeyMustBe256BitsLongForHS256Algorithm!!'
const JWT_EXPIRES = '24h'

export function signToken(subject, role) {
  return jwt.sign({ sub: subject, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES, algorithm: 'HS256' })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
}

export function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const h = req.headers.authorization
    if (!h?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    try {
      const payload = verifyToken(h.slice(7))
      const sub = payload.sub
      const role = payload.role
      if (requiredRole && role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' })
      }
      req.auth = { sub, role }
      next()
    } catch {
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
}

export function parsePrincipal(sub) {
  if (sub.startsWith('admin:')) return { type: 'admin', id: Number(sub.slice(6)) }
  if (sub.startsWith('student:')) return { type: 'student', id: Number(sub.slice(8)) }
  if (sub.startsWith('parent:')) return { type: 'parent', id: Number(sub.slice(7)) }
  return null
}
