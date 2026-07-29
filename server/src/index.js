import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import contentRoutes from './routes/content.js'
import uploadRoutes from './routes/upload.js'
import chapaRoutes, { webhookHandler } from './routes/chapa.js'
import submissionRoutes from './routes/submissions.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.set('trust proxy', 1)
app.use(cors({ origin: (process.env.SITE_ORIGIN || '').split(',').filter(Boolean), credentials: false }))

/* Chapa webhook MUST see the raw body for HMAC verification — mount BEFORE json parser */
app.post('/api/chapa/webhook', express.raw({ type: '*/*', limit: '1mb' }), webhookHandler)

app.use(express.json({ limit: '2mb' }))

/* uploaded images — same path works on cPanel (folder next to the app) */
app.use('/uploads', express.static(path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'), {
  maxAge: '30d',
  immutable: false,
}))

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))
app.use('/api/auth', authRoutes)
app.use('/api', contentRoutes)
app.use('/api', uploadRoutes)
app.use('/api', chapaRoutes)
app.use('/api', submissionRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' })
})

const port = +(process.env.PORT || 4000)
app.listen(port, () => console.log(`RTG API listening on :${port}`))
