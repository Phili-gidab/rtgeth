import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { nav as defaultNav } from '../data/content'
import { scrollToHash, prefersReducedMotion } from '../lib/scroll'
import { useContent } from '../lib/content.jsx'

const fmt = (tz) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date())

export default function Footer() {
  const ref = useRef(null)
  const { settings, headings } = useContent()
  const navItems = (headings.navItems || []).filter((n) => n.label && n.href)
  const nav = navItems.length ? navItems : defaultNav
  const [times, setTimes] = useState({ se: '--:--', et: '--:--' })
  const office = (text) => String(text || '').split('\n').map((line, i) => (
    line.startsWith('+') ? <a key={i} href={`tel:${line.replace(/\s/g, '')}`}>{line}</a> : <span key={i}>{line}<br /></span>
  ))

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
          <span className="am" lang="am">ይመለከተኛል</span>
          <span className="tr">{headings.footTranslation}</span>
        </div>
        <div className="foot-grid">
          <div className="fcol">
            <h4>Umeå — HQ</h4>
            <p className="clock" aria-label="Local time in Umeå">{times.se}</p>
            <p>{office(settings.officeSweden)}</p>
          </div>
          <div className="fcol">
            <h4>Addis Ababa — Field</h4>
            <p className="clock" aria-label="Local time in Addis Ababa">{times.et}</p>
            <p>{office(settings.officeEthiopia)}</p>
          </div>
          <div className="fcol">
            <h4>Write</h4>
            <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
            <p style={{ marginTop: 10 }}>Registered in Sweden<br />{settings.regNo}</p>
            <p style={{ marginTop: 14 }}>{headings.footNewsNote}</p>
            <a className="news-link" href={`mailto:${settings.email}?subject=Subscribe%20me%20to%20RTG%20field%20updates`}>Get field updates →</a>
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
          <span>{headings.footLegal}</span>
          <a className="to-top" href="#top" onClick={(e) => go(e, '#top')}>Back to top ↑</a>
          <span><i className="am" lang="am">ይመለከተኛል</i> — redesign concept, 2026</span>
        </div>
      </div>
    </footer>
  )
}
