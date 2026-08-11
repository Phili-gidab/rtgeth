import { useState } from 'react'
import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { useContent } from '../lib/content.jsx'
import { api } from '../admin/api'

/* renders "text |red| text" with the |...| span in accent color */
const Accent = ({ text, color = 'var(--red)' }) => {
  const parts = String(text || '').split('|')
  return parts.map((p, i) => (i % 2 ? <span key={i} lang="am" className="am" style={{ color }}>{p}</span> : p))
}

function MiniForm({ kind, title, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await api.submit({ kind, ...form })
      onDone(true)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form className="mini-form" onSubmit={submit}>
      <h4>{title}</h4>
      <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <textarea rows={3} placeholder={kind === 'volunteer' ? 'Your skills & availability' : 'Anything we should know?'} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {/* honeypot */}
      <input className="hp" tabIndex={-1} autoComplete="off" name="website" onChange={(e) => setForm({ ...form, website: e.target.value })} />
      {error && <p className="form-err">{error}</p>}
      <div className="mini-form-row">
        <button type="button" className="btn ghost-b" onClick={() => onDone(false)}>Cancel</button>
        <button className="btn solid" disabled={busy}>{busy ? 'Sending…' : 'Send'}</button>
      </div>
    </form>
  )
}

export default function Join() {
  const { join, tiers, settings } = useContent()
  const [mode, setMode] = useState('online') // online | bank
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('ETB')
  const [purpose, setPurpose] = useState('GENERAL')
  const [donor, setDonor] = useState({ first_name: '', last_name: '', email: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [panelForm, setPanelForm] = useState(null) // 'membership' | 'volunteer' | 'sent'

  const pickTier = (t) => {
    setAmount(String(t.amount).replace(/[^\d.]/g, ''))
    if (t.ref === 'GAMO') setPurpose('GAMO')
    else if (t.ref === 'MEMBER') setPurpose('MEMBER')
    else setPurpose('GENERAL')
  }

  const give = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const { checkout_url, tx_ref } = await api.donateInit({ amount, currency, purpose, ...donor })
      localStorage.setItem('rtg-pending-donation', JSON.stringify({ tx_ref, amount, startedAt: Date.now() }))
      /* same-tab redirect — popup-safe on every browser */
      window.location.href = checkout_url
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label); setTimeout(() => setCopied(''), 1600)
    } catch { /* ignore */ }
  }

  return (
    <section className="blk" id="join" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[6]} title="Take your part" tag="Member · Volunteer · Donor" />
        <div className="join-grid" data-rev>
          <div className="panel">
            <span className="tag">Membership — steady beats large</span>
            <h3><Accent text={join.memberTitle} /></h3>
            <div className="fee">{join.memberFee}<small>{join.memberFeeSub}</small></div>
            {panelForm === 'membership'
              ? <MiniForm kind="membership" title="Request membership" onDone={(ok) => setPanelForm(ok ? 'sent-m' : null)} />
              : panelForm === 'sent-m'
                ? <p className="form-ok">Request sent — we'll write back with the next steps. ያገባኛል.</p>
                : (
                  <>
                    <p>{join.memberBody}</p>
                    <button className="btn ghost-b" onClick={() => setPanelForm('membership')}>Become a member</button>
                  </>
                )}
          </div>
          <div className="panel">
            <span className="tag">Volunteering</span>
            <h3>Give what you know</h3>
            <div className="fee">Skills<small>medics · logistics · teaching · trades</small></div>
            {panelForm === 'volunteer'
              ? <MiniForm kind="volunteer" title="Join as a volunteer" onDone={(ok) => setPanelForm(ok ? 'sent-v' : null)} />
              : panelForm === 'sent-v'
                ? <p className="form-ok">Thank you — we'll be in touch about where your skills carry furthest.</p>
                : (
                  <>
                    <p>{join.volunteerBody}</p>
                    <button className="btn ghost-b" onClick={() => setPanelForm('volunteer')}>Join as volunteer</button>
                  </>
                )}
          </div>

          <div className="panel hot donate">
            <div className="donate-head">
              <span className="tag">Donation</span>
              <div className="donate-tabs" role="tablist">
                <button role="tab" aria-selected={mode === 'online'} className={mode === 'online' ? 'on' : ''} onClick={() => setMode('online')}>Pay online</button>
                <button role="tab" aria-selected={mode === 'bank'} className={mode === 'bank' ? 'on' : ''} onClick={() => setMode('bank')}>Bank transfer</button>
              </div>
            </div>
            <h3>{join.donateTitle}</h3>

            {mode === 'online' ? (
              <form className="donate-form" onSubmit={give}>
                <div className="tier-row" role="group" aria-label="Suggested amounts">
                  {tiers.map((t, i) => (
                    <button
                      type="button"
                      key={t.id ?? `${t.amount}-${i}`}
                      className={`tier${String(t.amount).replace(/[^\d.]/g, '') === amount ? ' on' : ''}${t.hot ? ' hot' : ''}`}
                      title={t.note || undefined}
                      onClick={() => pickTier(t)}
                    >
                      <span className="t-amt">{t.amount}</span>
                      {t.unit && <span className="t-unit">{t.unit}</span>}
                    </button>
                  ))}
                </div>
                <div className="donate-fields">
                  <label className="d-amount">
                    <span>Amount</span>
                    <div className="d-amount-in">
                      <input required inputMode="decimal" placeholder="1500" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Currency">
                        <option>ETB</option><option>USD</option>
                      </select>
                    </div>
                  </label>
                  <label><span>First name</span><input required value={donor.first_name} onChange={(e) => setDonor({ ...donor, first_name: e.target.value })} /></label>
                  <label><span>Last name</span><input value={donor.last_name} onChange={(e) => setDonor({ ...donor, last_name: e.target.value })} /></label>
                  <label><span>Email</span><input required type="email" value={donor.email} onChange={(e) => setDonor({ ...donor, email: e.target.value })} /></label>
                </div>
                <label className="d-purpose">
                  <span>Where should it go?</span>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    <option value="GENERAL">Where it's needed most</option>
                    {settings.campaignOn !== false && (
                      <option value="GAMO">{settings.campaignLabel || 'Gamo landslide response'}</option>
                    )}
                    <option value="MEMBER">Membership contribution</option>
                  </select>
                </label>
                {error && <p className="form-err">{error}</p>}
                <button className="btn donate-go" disabled={busy}>
                  {busy ? 'Opening secure checkout…' : `Give ${amount ? `${(+amount).toLocaleString()} ${currency}` : 'now'}`}
                </button>
                <p className="donate-secure">Payments are processed by Chapa on a secure page — cards, telebirr, CBE and more. We never see or store your card details.</p>
              </form>
            ) : (
              <div className="steps bank-only">
                <div className="step">
                  <b><i>1</i>Transfer</b>
                  <div className="bank">
                    {(join.bank || []).map((row) => (
                      <div key={row.label} className="bank-row">
                        <b>{row.label}</b>
                        <span>{row.value}</span>
                        {row.label !== 'Bank' && (
                          <button type="button" className="copy" onClick={() => copy(row.label, String(row.value).replace(/\s/g, ''))}>
                            {copied === row.label ? 'Copied ✓' : 'Copy'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="tier-note">{join.inKindNote}</p>
                </div>
                <div className="step">
                  <b><i>2</i>Tell us — we answer</b>
                  <p className="step-p">{join.step3}</p>
                  <a className="btn" href={`mailto:${settings.email}?subject=RTG%20Donation%20—%20bank%20transfer`}>Email your reference</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
