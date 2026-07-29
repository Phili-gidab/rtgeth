import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db/pool.js'
import { signToken, requireAdmin, rateLimit } from '../middleware/auth.js'

const router = Router()

router.post('/login', rateLimit({ windowMs: 300000, max: 10 }), async (req, res, next) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_disabled = 0', [email])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json({ token: signToken(user), user: { email: user.email, role: user.role } })
  } catch (e) { next(e) }
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ email: req.user.email, role: req.user.role })
})

export default router
