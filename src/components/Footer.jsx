import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { nav } from '../data/content'
import { scrollToHash, prefersReducedMotion } from '../lib/scroll'

const fmt = (tz) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date())

export default function Footer() {
  const ref = useRef(null)
  const [times, setTimes] = useState({ se: '--:--', et: '--:--' })

  useEffect(() => {
    const tick = () => setTimes({ se: fmt('Europe/Stockholm'), et: fmt('Africa/Addis_Ababa') })
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.foot-motto', {
        autoAlpha: 0,
        scale: 0.92,
        y: 40,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
      })
    },
    { scope: ref },
  )

  const go = (e, href) => { e.preventDefault(); scrollToHash(href) }

  return (
    <footer className="site-footer" ref={ref}>
      <div className="wrap">
        <div className="foot-motto">
          <span className="am" lang="am">ያገባኛል</span>
          <span className="tr">It concerns me · I am responsible</span>
        </div>
        <div className="foot-grid">
          <div className="fcol">
            <h4>Umeå — HQ</h4>
            <p className="clock" aria-label="Local time in Umeå">{times.se}</p>
            <p>Triangelgatan 21<br />907 52 Umeå, Sweden<br /><a href="tel:+46702370239">+46 702 370 239</a></p>
          </div>
          <div className="fcol">
            <h4>Addis Ababa — Field</h4>
            <p className="clock" aria-label="Local time in Addis Ababa">{times.et}</p>
            <p>Bole Subcity, Woreda 14<br />Addis Ababa, Ethiopia<br /><a href="tel:+251911412453">+251 911 412 453</a></p>
          </div>
          <div className="fcol">
            <h4>Write</h4>
            <p><a href="mailto:info@rtgeth.org">info@rtgeth.org</a></p>
            <p style={{ marginTop: 10 }}>Registered in Sweden<br />Org. nr 802538-0992</p>
            <p style={{ marginTop: 14 }}>Field updates — a few emails a year, always with photos.</p>
            <a className="news-link" href="mailto:info@rtgeth.org?subject=Subscribe%20me%20to%20RTG%20field%20updates">Get field updates →</a>
          </div>
          <div className="fcol">
            <h4>Go to</h4>
            <nav aria-label="Footer">
              {nav.map((n) => (
                <a key={n.href} href={n.href} onClick={(e) => go(e, n.href)}>{n.label}</a>
              ))}
              <a href="#join" onClick={(e) => go(e, '#join')}>Join &amp; donate</a>
            </nav>
          </div>
        </div>
        <div className="legal">
          <span>© 2026 Rescue The Generation · Non-profit, non-political, autonomous</span>
          <a className="to-top" href="#top" onClick={(e) => go(e, '#top')}>Back to top ↑</a>
          <span><i className="am" lang="am">ያገባኛል</i> — redesign concept, 2026</span>
        </div>
      </div>
    </footer>
  )
}
