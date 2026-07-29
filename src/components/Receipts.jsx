import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { prefersReducedMotion } from '../lib/scroll'
import { useContent } from '../lib/content.jsx'

export default function Receipts() {
  const ref = useRef(null)
  const { stats, settings } = useContent()

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
            <div className="stat" data-rev data-d={(i % 3) * 0.06} key={s.strong}>
              <div className="n">
                <span data-count={s.to}>0</span>
                {s.suffix === '+' ? <sup>+</sup> : s.suffix}
              </div>
              <p className="l"><b>{s.strong}</b>{s.rest}</p>
            </div>
          ))}
        </div>
        <div className="stats-foot" data-rev>
          <p className="q">"<b>Time is life.</b> Every number above has a name, a town, and a receipt."</p>
        </div>
        <div className="clarity" data-rev>
          <b>Where the money goes:</b> {settings.clarity} Want the numbers? Our one-page financial
          summary is an email away:{' '}
          <a href={`mailto:${settings.email}?subject=Financial%20summary%20request`}>{settings.email}</a>.
        </div>
      </div>
    </section>
  )
}
