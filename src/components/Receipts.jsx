import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SectionHead from './SectionHead'
import { stats, geez } from '../data/content'
import { prefersReducedMotion } from '../lib/scroll'

export default function Receipts() {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const to = +el.dataset.count
        const state = { v: 0 }
        gsap.to(state, {
          v: to,
          duration: 1.6,
          ease: 'power3.out',
          snap: { v: 1 },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => { el.textContent = state.v.toLocaleString() },
        })
      })
    },
    { scope: ref },
  )

  return (
    <section className="blk proof" id="proof" ref={ref}>
      <div className="wrap">
        <SectionHead num={geez[2]} title="We count what we do" tag="Receipts, not promises · as of July 2026" />
        <div className="stats">
          {stats.map((s, i) => (
            <div className="stat" data-rev data-d={(i % 3) * 0.06} key={s.label[0]}>
              <div className="n">
                <span data-count={s.to}>0</span>
                {s.suffix === '+' ? <sup>+</sup> : s.suffix}
              </div>
              <p className="l"><b>{s.label[0]}</b>{s.label[1]}</p>
            </div>
          ))}
        </div>
        <div className="stats-foot" data-rev>
          <p className="q">"<b>Time is life.</b> Every number above has a name, a town, and a receipt."</p>
        </div>
        <div className="clarity" data-rev>
          <b>Where the money goes:</b> RTG is volunteer-run — the board serves unpaid, and no salaries
          are drawn from donations. Registered non-profit in Sweden, org. nr 802538-0992, with a country
          office in Addis Ababa. Want the numbers? Our one-page financial summary is an email away:{' '}
          <a href="mailto:info@rtgeth.org?subject=Financial%20summary%20request">info@rtgeth.org</a>.
        </div>
      </div>
    </section>
  )
}
