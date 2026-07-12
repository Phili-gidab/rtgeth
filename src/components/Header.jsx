import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { nav, images } from '../data/content'
import { scrollToHash, prefersReducedMotion } from '../lib/scroll'

const initialTheme = () => {
  const saved = localStorage.getItem('rtg-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function Header() {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const [theme, setTheme] = useState(initialTheme)
  const [ribbon, setRibbon] = useState(() => sessionStorage.getItem('rtg-ribbon-hidden') !== '1')

  const dismissRibbon = () => {
    setRibbon(false)
    sessionStorage.setItem('rtg-ribbon-hidden', '1')
  }

  /* theme toggle stamps data-theme on <html>; wins over the media query */
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rtg-theme', theme)
  }, [theme])

  const go = (e, href) => {
    e.preventDefault()
    setOpen(false)
    document.body.style.overflow = ''
    scrollToHash(href)
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    document.body.style.overflow = next ? 'hidden' : ''
  }

  /* hide on scroll down, return on scroll up */
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const show = gsap
      .from(ref.current, { yPercent: -100, paused: true, duration: 0.3, ease: 'power2.out' })
      .progress(1)
    ScrollTrigger.create({
      start: 'top top-=120',
      end: 'max',
      onUpdate: (self) => (self.direction === -1 ? show.play() : show.reverse()),
    })
  })

  /* track which section the reader is in */
  useGSAP(() => {
    nav.forEach((n) => {
      const el = document.querySelector(n.href)
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => { if (self.isActive) setActive(n.href) },
      })
    })
  })

  return (
    <>
      <header className="site-header" ref={ref}>
        {ribbon && (
          <div className="ribbon" role="region" aria-label="Emergency appeal">
            <div className="wrap ribbon-in">
              <b>Urgent · July 2026</b>
              <span className="ribbon-txt">Gamo landslide response — 500,000 birr committed to affected families. Help us reach more.</span>
              <a href="#join" onClick={(e) => go(e, '#join')}>Give now →</a>
              <button type="button" onClick={dismissRibbon} aria-label="Dismiss emergency banner">✕</button>
            </div>
          </div>
        )}
        <div className="wrap hbar">
          <a className="brand" href="#top" onClick={(e) => go(e, '#top')} aria-label="Rescue The Generation — home">
            <span className="chip"><img src={images.logo} alt="" width="30" height="30" /></span>
            <span>
              <b>Rescue The Generation</b>
              <span className="sub">Yagebanal · Est. 2020</span>
            </span>
          </a>
          <nav className="main" aria-label="Primary">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={active === n.href ? 'active' : undefined}
                onClick={(e) => go(e, n.href)}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <button
            className="theme-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <a className="donate-btn" href="#join" onClick={(e) => go(e, '#join')}>Donate</a>
          <button
            className="menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mnav"
            onClick={toggle}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      <nav id="mnav" className={`mnav${open ? ' open' : ''}`} aria-label="Mobile">
        {nav.map((n) => (
          <a key={n.href} href={n.href} onClick={(e) => go(e, n.href)}>{n.label}</a>
        ))}
        <a className="hot" href="#join" onClick={(e) => go(e, '#join')}>Donate</a>
        <div className="mnav-foot">
          <span className="am" lang="am">ያገባኛል</span>
          <span className="tag">It concerns me · Det angår mig</span>
        </div>
      </nav>
    </>
  )
}
