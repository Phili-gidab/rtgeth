import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAdmin, rateLimit } from '../middleware/auth.js'

const router = Router()
const KINDS = ['volunteer', 'membership', 'contact']

router.post('/submit', rateLimit({ windowMs: 60000, max: 6 }), async (req, res, next) => {
  try {
    const { kind, name, email, phone, message, website, ...extra } = req.body || {}
    /* honeypot: real users never fill "website" */
    if (website) return res.json({ ok: true })
    if (!KINDS.includes(kind)) return res.status(400).json({ error: 'Bad submission type' })
    if (!name || String(name).length > 190) return res.status(400).json({ error: 'Name is required' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' })
    await pool.query(
      'INSERT INTO submissions (kind, name, email, phone, message, extra) VALUES (?,?,?,?,?,?)',
      [kind, String(name).slice(0, 190), email, String(phone || '').slice(0, 64) || null,
       String(message || '').slice(0, 5000) || null, Object.keys(extra).length ? JSON.stringify(extra) : null],
    )
    res.status(201).json({ ok: true })
  } catch (e) { next(e) }
})

router.get('/admin/submissions', requireAdmin, async (req, res, next) => {
  try {
    const kind = KINDS.includes(req.query.kind) ? req.query.kind : null
    const [rows] = await pool.query(
      `SELECT id, kind, name, email, phone, message, extra, is_read, created_at FROM submissions ${kind ? 'WHERE kind = ?' : ''} ORDER BY created_at DESC LIMIT 500`,
      kind ? [kind] : [],
    )
    res.json(rows)
  } catch (e) { next(e) }
})

router.put('/admin/submissions/:id/read', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('UPDATE submissions SET is_read = 1 WHERE id = ?', [+req.params.id])
    res.json({ ok: true })
  } catch (e) { next(e) }
})

export default router
