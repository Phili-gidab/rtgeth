import { useState } from 'react'
import SectionHead from './SectionHead'
import { tiers, bank, geez } from '../data/content'

export default function Join() {
  const [tier, setTier] = useState(1)
  const [copied, setCopied] = useState('')

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(''), 1600)
    } catch {
      setCopied('')
    }
  }

  const ref = tiers[tier].ref
  const mailSubject = encodeURIComponent(`RTG Donation — transfer reference ${ref}`)

  return (
    <section className="blk" id="join" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[6]} title="Take your part" tag="Member · Volunteer · Donor" />
        <div className="join-grid" data-rev>
          <div className="panel">
            <span className="tag">Membership — steady beats large</span>
            <h3>Join the <span lang="am" className="am" style={{ color: 'var(--red)' }}>ያገባኛል</span> circle</h3>
            <div className="fee">100 birr<small>≈ SEK 100 · $10 · €10 / month</small></div>
            <p>
              Members are the people who said "it concerns me" — every month. Steady income
              is what lets us commit to a school year, not just a delivery. Open to everyone 18+,
              with a vote in the General Assembly.
            </p>
            <a className="btn ghost-b" href="mailto:info@rtgeth.org?subject=RTG%20Membership">Become a member</a>
          </div>
          <div className="panel">
            <span className="tag">Volunteering</span>
            <h3>Give what you know</h3>
            <div className="fee">Skills<small>medics · logistics · teaching · trades</small></div>
            <p>
              RTG is a worldwide association of volunteers. First responders and medical
              doctors are especially needed in emergency areas — but every skill carries,
              from anywhere.
            </p>
            <a className="btn ghost-b" href="mailto:info@rtgeth.org?subject=RTG%20Volunteering">Join as volunteer</a>
          </div>
          <div className="panel hot donate">
            <span className="tag">Donation · bank transfer</span>
            <h3>Give — and hear back</h3>
            <div className="steps">
              <div className="step">
                <b><i>1</i>Choose an amount</b>
                <div className="tier-row" role="group" aria-label="Suggested amounts">
                  {tiers.map((t, i) => (
                    <button
                      key={t.amount}
                      type="button"
                      className={`tier${i === tier ? ' on' : ''}`}
                      aria-pressed={i === tier}
                      onClick={() => setTier(i)}
                    >
                      <span className="t-amt">{t.amount}</span>
                      {t.unit && <span className="t-unit">{t.unit}</span>}
                    </button>
                  ))}
                </div>
                <p className="tier-note">{tiers[tier].note}</p>
              </div>
              <div className="step">
                <b><i>2</i>Transfer</b>
                <div className="bank">
                  {bank.map((row) => (
                    <div key={row.label} className="bank-row">
                      <b>{row.label}</b>
                      <span>{row.value}</span>
                      {row.copy && (
                        <button type="button" className="copy" onClick={() => copy(row.label, row.value.replace(/\s/g, ''))}>
                          {copied === row.label ? 'Copied ✓' : 'Copy'}
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="bank-row">
                    <b>Ref</b>
                    <span>{ref}</span>
                    <button type="button" className="copy" onClick={() => copy('Ref', ref)}>
                      {copied === 'Ref' ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p className="tier-note">In-kind counts too — tents, mattresses, hygiene kits. A single mattress can protect a family of four.</p>
              </div>
              <div className="step">
                <b><i>3</i>Tell us — we answer</b>
                <p className="step-p">
                  Email us your transfer reference. We confirm receipt personally — and later
                  send a thank-you with a photo update from the program your gift funded.
                  That's the receipt a bank can't give you.
                </p>
                <a className="btn" href={`mailto:info@rtgeth.org?subject=${mailSubject}`}>Email your reference</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
