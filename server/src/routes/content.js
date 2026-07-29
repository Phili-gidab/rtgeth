import { Router } from 'express'
import { pool } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

const SINGLETON_KEYS = ['hero', 'who', 'story', 'join', 'settings']
const COLLECTIONS = ['programs', 'stats', 'gallery', 'people', 'faqs', 'partners', 'updates']

const validKey = (k) => /^[a-z][a-z0-9_-]{1,63}$/.test(k)

/* ---------- public: the whole site content in one call ---------- */
router.get('/content', async (_req, res, next) => {
  try {
    const [singles] = await pool.query('SELECT k, data FROM content')
    const [items] = await pool.query(
      'SELECT id, collection, data, sort FROM items WHERE published = 1 ORDER BY collection, sort, id',
    )
    const out = { singles: {}, collections: {} }
    for (const row of singles) out.singles[row.k] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
    for (const row of items) {
      const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data
      ;(out.collections[row.collection] ||= []).push({ id: row.id, ...data })
    }
    res.set('Cache-Control', 'public, max-age=60')
    res.json(out)
  } catch (e) { next(e) }
})

/* ---------- admin: singletons ---------- */
router.get('/admin/content/:key', requireAdmin, async (req, res, next) => {
  try {
    if (!validKey(req.params.key)) return res.status(400).json({ error: 'Bad key' })
    const [rows] = await pool.query('SELECT data FROM content WHERE k = ?', [req.params.key])
    res.json(rows[0] ? (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) : null)
  } catch (e) { next(e) }
})

router.put('/admin/content/:key', requireAdmin, async (req, res, next) => {
  try {
    const { key } = req.params
    if (!validKey(key)) return res.status(400).json({ error: 'Bad key' })
    /* merge-save like GSTS setDoc(..., {merge:true}) — partial saves never clobber */
    const [rows] = await pool.query('SELECT data FROM content WHERE k = ?', [key])
    const current = rows[0] ? (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) : {}
    const merged = { ...current, ...req.body }
    await pool.query(
      'INSERT INTO content (k, data, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_by = VALUES(updated_by)',
      [key, JSON.stringify(merged), req.user.email],
    )
    res.json(merged)
  } catch (e) { next(e) }
})

/* ---------- admin: generic collections (GSTS-style, no per-type code) ---------- */
router.get('/admin/items/:collection', requireAdmin, async (req, res, next) => {
  try {
    const { collection } = req.params
    if (!validKey(collection)) return res.status(400).json({ error: 'Bad collection' })
    const [rows] = await pool.query(
      'SELECT id, data, sort, published, updated_at FROM items WHERE collection = ? ORDER BY sort, id',
      [collection],
    )
    res.json(rows.map((r) => ({
      id: r.id,
      sort: r.sort,
      published: !!r.published,
      updatedAt: r.updated_at,
      ...(typeof r.data === 'string' ? JSON.parse(r.data) : r.data),
    })))
  } catch (e) { next(e) }
})

router.post('/admin/items/:collection', requireAdmin, async (req, res, next) => {
  try {
    const { collection } = req.params
    if (!validKey(collection)) return res.status(400).json({ error: 'Bad collection' })
    const { published = true, sort, ...data } = req.body || {}
    const [[{ maxSort }]] = await pool.query(
      'SELECT COALESCE(MAX(sort), 0) AS maxSort FROM items WHERE collection = ?', [collection],
    )
    const [result] = await pool.query(
      'INSERT INTO items (collection, data, sort, published) VALUES (?, ?, ?, ?)',
      [collection, JSON.stringify(data), sort ?? maxSort + 1, published ? 1 : 0],
    )
    res.status(201).json({ id: result.insertId })
  } catch (e) { next(e) }
})

router.put('/admin/items/:collection/:id', requireAdmin, async (req, res, next) => {
  try {
    const { collection, id } = req.params
    if (!validKey(collection)) return res.status(400).json({ error: 'Bad collection' })
    const { published, sort, ...data } = req.body || {}
    const sets = ['data = ?']
    const args = [JSON.stringify(data)]
    if (published !== undefined) { sets.push('published = ?'); args.push(published ? 1 : 0) }
    if (sort !== undefined) { sets.push('sort = ?'); args.push(+sort) }
    args.push(collection, +id)
    const [r] = await pool.query(`UPDATE items SET ${sets.join(', ')} WHERE collection = ? AND id = ?`, args)
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

router.delete('/admin/items/:collection/:id', requireAdmin, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM items WHERE collection = ? AND id = ?', [req.params.collection, +req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

router.post('/admin/items/:collection/reorder', requireAdmin, async (req, res, next) => {
  try {
    const { order } = req.body || {}
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of ids' })
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      for (let i = 0; i < order.length; i++) {
        await conn.query('UPDATE items SET sort = ? WHERE collection = ? AND id = ?', [i + 1, req.params.collection, +order[i]])
      }
      await conn.commit()
    } catch (e) {
      await conn.rollback(); throw e
    } finally {
      conn.release()
    }
    res.json({ ok: true })
  } catch (e) { next(e) }
})

/* ---------- admin: dashboards ---------- */
router.get('/admin/donations', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, tx_ref, amount, currency, first_name, last_name, email, purpose, status, created_at, verified_at FROM donations ORDER BY created_at DESC LIMIT 500',
    )
    res.json(rows)
  } catch (e) { next(e) }
})

export { SINGLETON_KEYS, COLLECTIONS }
export default router
