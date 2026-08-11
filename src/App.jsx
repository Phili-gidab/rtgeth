import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

import { setLenis, getLenis, prefersReducedMotion } from './lib/scroll'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Who from './components/Who'
import Work from './components/Work'
import Receipts from './components/Receipts'
import Story from './components/Story'
import Field from './components/Field'
import People from './components/People'
import Join from './components/Join'
import Faq from './components/Faq'
import Updates from './components/Updates'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const [ready, setReady] = useState(false)
  const rlineRef = useRef(null)
  const mainRef = useRef(null)

  /* Lenis smooth scroll, driven by the GSAP ticker */
  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const lenis = new Lenis({ autoRaf: false, lerp: 0.11 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  /* deep links: the anchor target doesn't exist until React renders, so the
     browser's native hash jump silently fails. Jump through Lenis (a native
     jump desyncs its internal scroll state) and re-sync ScrollTrigger. */
  useEffect(() => {
    const { hash } = window.location
    if (!hash) return
    const t = setTimeout(() => {
      const target = document.querySelector(hash)
      if (!target) return
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true, offset: -68 })
      else target.scrollIntoView()
      ScrollTrigger.refresh()
    }, 150)
    return () => clearTimeout(t)
  }, [])

  /* Global scroll choreography: progress line + generic reveals */
  useGSAP(
    () => {
      gsap.to(rlineRef.current, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
      })

      if (prefersReducedMotion()) return

      gsap.utils.toArray('[data-rev]').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 30,
          duration: 0.9,
          ease: 'power3.out',
          delay: parseFloat(el.dataset.d || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      // photo curtain reveals
      gsap.utils.toArray('[data-clip]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.2,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          },
        )
      })

      ScrollTrigger.refresh()
    },
    { scope: mainRef },
  )

  return (
    <div ref={mainRef}>
      <a className="skip" href="#main">Skip to content</a>
      <Loader onDone={() => setReady(true)} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <div className="rline" aria-hidden="true"><i ref={rlineRef} /></div>
      <Header />
      <main id="main">
        <Hero ready={ready} />
        <Marquee />
        <Who />
        <Work />
        <Receipts />
        <Story />
        <Field />
        <People />
        <Join />
        <Faq />
        <Updates />
      </main>
      <Footer />
    </div>
  )
}
