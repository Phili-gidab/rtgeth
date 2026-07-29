/*
 * Chapa donation flow — ported from the production-hardened Delta_SPMU
 * implementation (Python/Frappe → Express). Design rules preserved:
 *  - single guest-exposed webhook entry point, fail closed everywhere
 *  - HMAC over the RAW body; Chapa sends two signature headers with
 *    different meanings (x-chapa-signature = HMAC(body), Chapa-Signature
 *    = HMAC(secret)); accept either, timing-safe compare
 *  - webhook alone is never trusted: re-verify against /transaction/verify
 *    and require the amount to match the stored expectation (0 = mismatch)
 *  - idempotent: already-success tx_refs return early; tx_ref is never
 *    reused (Chapa rejects duplicates) — retries mint a fresh one
 *  - amount serialized as a string; customization.title must be ≤16 chars
 */
import { Router } from 'express'
import crypto from 'node:crypto'
import axios from 'axios'
import { pool } from '../db/pool.js'
import { rateLimit } from '../middleware/auth.js'

const CHAPA_BASE = 'https://api.chapa.co/v1'
const MIN_AMOUNT = +(process.env.DONATION_MIN || 10)
const MAX_AMOUNT = +(process.env.DONATION_MAX || 1000000)
const CURRENCIES = ['ETB', 'USD']
const PURPOSES = ['GENERAL', 'GAMO', 'MEMBER']

const chapa = axios.create({
  baseURL: CHAPA_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})
chapa.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${process.env.CHAPA_SECRET_KEY || ''}`
  return config
})

const makeTxRef = () => {
  const ts = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  return `RTG-${ts}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

const router = Router()

/* ---------- init (public — donations are anonymous) ---------- */
router.post('/donate/init', rateLimit({ windowMs: 60000, max: 8 }), async (req, res, next) => {
  try {
    const { amount, currency = 'ETB', email, first_name, last_name, phone, purpose = 'GENERAL' } = req.body || {}

    const amt = Math.round(parseFloat(amount) * 100) / 100
    if (!Number.isFinite(amt) || amt < MIN_AMOUNT || amt > MAX_AMOUNT) {
      return res.status(400).json({ error: `Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT.toLocaleString()}` })
    }
    if (!CURRENCIES.includes(currency)) return res.status(400).json({ error: 'Unsupported currency' })
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' })
    if (!first_name || String(first_name).length > 120) return res.status(400).json({ error: 'First name is required' })
    const safePurpose = PURPOSES.includes(purpose) ? purpose : 'GENERAL'

    const txRef = makeTxRef()
    /* persist BEFORE calling Chapa — the stored amount is the security anchor */
    await pool.query(
      'INSERT INTO donations (tx_ref, amount, currency, first_name, last_name, email, purpose, status) VALUES (?,?,?,?,?,?,?,?)',
      [txRef, amt, currency, String(first_name).slice(0, 120), String(last_name || '').slice(0, 120), email, safePurpose, 'initialized'],
    )

    const returnUrl = new URL('/donate/thanks', process.env.SITE_ORIGIN.split(',')[0])
    returnUrl.searchParams.set('tx_ref', txRef)

    const payload = {
      amount: String(amt),
      currency,
      email,
      first_name: String(first_name).slice(0, 120),
      last_name: String(last_name || '').slice(0, 120),
      tx_ref: txRef,
      callback_url: `${process.env.API_ORIGIN}/api/chapa/webhook`,
      return_url: returnUrl.toString(),
      customization: {
        title: 'Rescue The Gen.', // Chapa caps title at 16 chars
        description: safePurpose === 'GAMO' ? 'Gamo landslide relief' : 'Donation to Rescue The Generation',
      },
    }
    if (phone) payload.phone_number = String(phone).slice(0, 32)

    let data
    try {
      ;({ data } = await chapa.post('/transaction/initialize', payload))
    } catch (err) {
      const body = err.response?.data
      console.error('Chapa init failed', err.response?.status, body)
      await pool.query('UPDATE donations SET status = "failed" WHERE tx_ref = ?', [txRef])
      return res.status(502).json({ error: body?.message || 'Payment provider unavailable — try again shortly' })
    }

    const checkoutUrl = data?.data?.checkout_url
    if (!checkoutUrl) {
      await pool.query('UPDATE donations SET status = "failed" WHERE tx_ref = ?', [txRef])
      return res.status(502).json({ error: 'Payment provider did not return a checkout page' })
    }
    await pool.query('UPDATE donations SET status = "pending" WHERE tx_ref = ?', [txRef])
    res.json({ checkout_url: checkoutUrl, tx_ref: txRef })
  } catch (e) { next(e) }
})

/* ---------- shared verification gate (webhook + status poll use the SAME rules) ---------- */
async function verifyAndSettle(txRef) {
  const [rows] = await pool.query('SELECT * FROM donations WHERE tx_ref = ?', [txRef])
  const donation = rows[0]
  if (!donation) return { ok: false, code: 404, msg: 'Unknown transaction' }
  if (donation.status === 'success') return { ok: true, donation, already: true }

  let verify
  try {
    ;({ data: verify } = await chapa.get(`/transaction/verify/${encodeURIComponent(txRef)}`))
  } catch (err) {
    return { ok: false, code: 502, msg: 'Verification unavailable', donation }
  }
  const v = verify?.data || {}
  const status = String(v.status || verify?.status || '').toLowerCase()
  if (!['success', 'completed', 'paid'].includes(status)) {
    return { ok: false, code: 200, msg: `Not confirmed (${status || 'pending'})`, donation }
  }
  const verifiedAmount = parseFloat(v.amount || 0)
  /* zero/missing verified amount is a MISMATCH — fail closed */
  if (!Number.isFinite(verifiedAmount) || Math.abs(verifiedAmount - parseFloat(donation.amount)) > 0.01) {
    await pool.query('UPDATE donations SET status = "failed", raw_verify = ? WHERE tx_ref = ?', [JSON.stringify(v), txRef])
    return { ok: false, code: 200, msg: 'Amount mismatch', donation }
  }
  await pool.query(
    'UPDATE donations SET status = "success", chapa_ref_id = ?, raw_verify = ?, verified_at = NOW() WHERE tx_ref = ?',
    [v.reference || null, JSON.stringify(v), txRef],
  )
  donation.status = 'success'
  return { ok: true, donation }
}

/* ---------- webhook (mounted with express.raw in index.js) ---------- */
export async function webhookHandler(req, res) {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '')
    if (!raw.length) return res.status(400).json({ status: 'error', message: 'Empty payload' })

    const secret = process.env.CHAPA_WEBHOOK_SECRET
    const sigHeaders = [req.headers['chapa-signature'], req.headers['x-chapa-signature']].filter(Boolean)
    if (secret) {
      const sigBody = crypto.createHmac('sha256', secret).update(raw).digest('hex')
      const sigSecret = crypto.createHmac('sha256', secret).update(secret).digest('hex')
      const match = sigHeaders.some((h) => {
        try {
          const hb = Buffer.from(String(h))
          return (
            (hb.length === Buffer.from(sigBody).length && crypto.timingSafeEqual(hb, Buffer.from(sigBody))) ||
            (hb.length === Buffer.from(sigSecret).length && crypto.timingSafeEqual(hb, Buffer.from(sigSecret)))
          )
        } catch { return false }
      })
      if (!match) return res.status(401).json({ status: 'error', message: 'Invalid signature' })
    } else if (sigHeaders.length === 0) {
      console.warn('Chapa webhook: no CHAPA_WEBHOOK_SECRET configured and no signature header — relying on re-verification only')
    }

    let data
    try { data = JSON.parse(raw.toString('utf8')) } catch { return res.status(400).json({ status: 'error', message: 'Bad JSON' }) }

    let txRef = data.tx_ref || data.trx_ref || ''
    let status = String(data.status || '').toLowerCase()
    const event = data.event || ''
    if (!txRef && typeof data.data === 'object' && data.data) {
      txRef = data.data.tx_ref || ''
      status = String(data.data.status || status).toLowerCase()
    }
    if (!txRef) return res.status(400).json({ status: 'error', message: 'Missing transaction reference' })

    const isSuccess = event === 'charge.success' || ['success', 'completed', 'paid'].includes(status)
    const isFailure = ['charge.failed', 'charge.cancelled'].includes(event) || ['failed', 'cancelled'].includes(status)

    if (isSuccess) {
      const result = await verifyAndSettle(txRef)
      if (result.already) return res.json({ status: 'success', message: 'Already processed' })
      if (!result.ok) return res.status(result.code === 404 ? 404 : 200).json({ status: 'error', message: result.msg })
      return res.json({ status: 'success', message: 'Donation recorded' })
    }
    if (isFailure) {
      await pool.query('UPDATE donations SET status = "failed" WHERE tx_ref = ? AND status != "success"', [txRef])
      return res.json({ status: 'ok', message: 'Failure recorded' })
    }
    return res.json({ status: 'ok', message: 'Event recorded' })
  } catch (e) {
    console.error('Webhook error', e)
    return res.status(500).json({ status: 'error', message: 'Internal error' })
  }
}

/* ---------- status poll (thank-you page; mirrors the webhook's gate) ---------- */
router.get('/donate/status', rateLimit({ windowMs: 60000, max: 30 }), async (req, res, next) => {
  try {
    const txRef = String(req.query.tx_ref || '')
    if (!/^RTG-\d{14}-[0-9A-F]{6}$/.test(txRef)) return res.status(400).json({ error: 'Bad reference' })
    const result = await verifyAndSettle(txRef)
    if (!result.donation) return res.status(404).json({ error: 'Unknown transaction' })
    const d = result.donation
    res.json({
      tx_ref: txRef,
      status: d.status,
      amount: d.amount,
      currency: d.currency,
      purpose: d.purpose,
      first_name: d.first_name,
    })
  } catch (e) { next(e) }
})

export default router
