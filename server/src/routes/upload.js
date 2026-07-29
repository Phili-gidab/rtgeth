import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { requireAdmin } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg', 'application/pdf': '.pdf' }

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED[file.mimetype]) return cb(new Error('Only JPG, PNG, WebP, SVG or PDF files are allowed'))
    cb(null, true)
  },
})

const router = Router()

router.post('/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' })
  res.status(201).json({ url: `/uploads/${req.file.filename}`, size: req.file.size, name: req.file.originalname })
})

router.delete('/admin/upload/:name', requireAdmin, (req, res) => {
  const name = path.basename(req.params.name) // no traversal
  const target = path.join(uploadDir, name)
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Not found' })
  fs.unlinkSync(target)
  res.json({ ok: true })
})

export default router
