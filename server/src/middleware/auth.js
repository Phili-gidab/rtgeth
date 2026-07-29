import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
if (!SECRET) console.warn('WARNING: JWT_SECRET is not set — set it in .env before going live.')

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '12h' },
  )
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, SECRET)
    if (!['super_admin', 'admin', 'editor'].includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ error: 'Session expired — log in again' })
  }
}

export function requireSuperAdmin(req, res, next) {
  requireAdmin(req, res, () => {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super admin only' })
    next()
  })
}

/* tiny fixed-window rate limiter for public endpoints (single-instance; fine on cPanel too) */
const hits = new Map()
export function rateLimit({ windowMs = 60000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`
    const now = Date.now()
    const entry = hits.get(key)
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 })
      return next()
    }
    entry.count += 1
    if (entry.count > max) return res.status(429).json({ error: 'Too many requests — try again shortly' })
    return next()
  }
}
