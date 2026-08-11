import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../admin/api'
import { images } from '../data/content'
import { useContent } from '../lib/content.jsx'

/* ~5 minutes total: 12 checks 5s apart, then every 10s (Chapa settles in seconds normally) */
const MAX_POLLS = 36
const pollDelay = (n) => (n < 12 ? 5000 : 10000)

/* the return_url normally carries tx_ref; fall back to the reference stashed at checkout */
function pendingTxRef() {
  try {
    const saved = JSON.parse(localStorage.getItem('rtg-pending-donation') || 'null')
    return typeof saved?.tx_ref === 'string' ? saved.tx_ref : ''
  } catch { return '' }
}

export default function Thanks() {
  const [params] = useSearchParams()
  const txRef = params.get('tx_ref') || pendingTxRef()
  const { settings } = useContent()
  const email = settings?.email || 'info@rtgeth.org'
  const [state, setState] = useState({ status: txRef ? 'checking' : 'missing' })
  const polls = useRef(0)

  useEffect(() => {
    if (!txRef) return undefined
    let timer
    const check = async () => {
      polls.current += 1
      try {
        const d = await api.donateStatus(txRef)
        if (d.status === 'success' || d.status === 'failed') {
          localStorage.removeItem('rtg-pending-donation')
          setState({ ...d, status: d.status })
          return
        }
        /* 'initialized' (donor returned before paying) reads as pending too */
        setState({ ...d, status: 'pending' })
      } catch {
        /* transient network errors: keep polling */
      }
      if (polls.current < MAX_POLLS) timer = setTimeout(check, pollDelay(polls.current))
      else setState((s) => ({ ...s, status: 'slow' }))
    }
    check()
    return () => clearTimeout(timer)
  }, [txRef])

  const { status } = state
  return (
    <div className="thanks">
      <header className="thanks-head">
        <Link to="/" className="brand">
          <span className="chip"><img src={images.logo} alt="" width="30" height="30" /></span>
          <span><b>Rescue The Generation</b></span>
        </Link>
      </header>
      <main className="thanks-main">
        {status === 'missing' && (
          <>
            <h1>No donation reference found</h1>
            <p>If you just gave, check the link in your confirmation — or <Link to="/#join">start a donation</Link>.</p>
          </>
        )}
        {(status === 'checking' || status === 'pending') && (
          <>
            <div className="thanks-spin" aria-hidden="true" />
            <h1>Confirming your donation…</h1>
            <p>We're verifying your payment with Chapa. This usually takes a few seconds — you can keep this page open.</p>
            <p className="thanks-ref">Reference: <b>{txRef}</b></p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="thanks-mark am" lang="am">ያገባኛል</div>
            <h1>It concerned you. Thank you{state.first_name ? `, ${state.first_name}` : ''}.</h1>
            <p>
              Your gift of <b>{(+state.amount).toLocaleString()} {state.currency}</b>
              {state.purpose === 'GAMO' ? ' to the Gamo landslide response' : ''} is confirmed and recorded.
              We'll email you a photo update from the work it funds.
            </p>
            <p className="thanks-ref">Receipt reference: <b>{txRef}</b></p>
            <Link className="btn solid" to="/">Back to the site</Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <h1>The payment didn't complete</h1>
            <p>Nothing was charged, or the charge was cancelled. You can safely try again — a fresh payment reference will be created.</p>
            <Link className="btn solid" to="/#join">Try again</Link>
          </>
        )}
        {status === 'slow' && (
          <>
            <h1>Still confirming…</h1>
            <p>
              Your payment may still be settling. If you completed the payment, it will be recorded —
              write to <a href={`mailto:${email}`}>{email}</a> with reference <b>{txRef}</b> and
              we'll confirm personally.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
