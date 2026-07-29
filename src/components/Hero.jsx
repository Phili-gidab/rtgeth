import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { images } from '../data/content'
import { scrollToHash, prefersReducedMotion } from '../lib/scroll'
import { useContent, resolveImg } from '../lib/content.jsx'
import Magnetic from './Magnetic'

export default function Hero({ ready }) {
  const ref = useRef(null)
  const { hero } = useContent()
  const [l1 = 'It', l2 = 'Concerns', l3 = 'Me.'] = hero.titleLines || []
  const subRest = String(hero.sub || '').replace(/^Yagebanal\.\s*/, '')

  /* intro — fired once the loader lifts */
  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.from('.hero h1 .row i', { yPercent: 112, duration: 1.1, stagger: 0.09 }, 0)
        .from('.kicker', { autoAlpha: 0, x: -24, duration: 0.7 }, 0.35)
        .from('.hero-sub', { autoAlpha: 0, y: 24, duration: 0.8 }, 0.55)
        .from('.cta-row', { autoAlpha: 0, y: 24, duration: 0.8 }, 0.7)
        .fromTo(
          '.hero-photo .ph',
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power4.inOut' },
          0.4,
        )
        .from('.hero-photo .cap', { autoAlpha: 0, duration: 0.6 }, 1.3)
        .from('.ghost', { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 0.8)
        .from('.scroll-cue', { autoAlpha: 0, duration: 0.6 }, 1.4)
      gsap.to('.scroll-cue i', {
        scaleY: 1,
        transformOrigin: 'top',
        duration: 1.2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
      })
    },
    { scope: ref, dependencies: [ready] },
  )

  /* ghost glyph + atmosphere parallax, at different depths */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const st = { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
      gsap.to('.ghost', { yPercent: 34, ease: 'none', scrollTrigger: st })
      gsap.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: st })
    },
    { scope: ref },
  )

  const go = (e, href) => { e.preventDefault(); scrollToHash(href) }

  return (
    <section className="hero" id="top" ref={ref}>
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${images.atmosphere})` }}
        aria-hidden="true"
      />
      <div className="ghost am" lang="am" aria-hidden="true">ያገባኛል</div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="kicker tag">{hero.kicker}</p>
          <h1>
            <span className="row"><i>{l1}</i></span>
            <span className="row"><i>{l2}</i></span>
            <span className="row"><i className="red me">{l3}</i></span>
          </h1>
          <p className="hero-sub">
            <em lang="am" className="am">ያገባኛል</em> — <em>Yagebanal.</em> {subRest}
          </p>
          <div className="cta-row">
            <Magnetic><a className="btn solid" href="#join" onClick={(e) => go(e, '#join')}>{hero.ctaPrimary}</a></Magnetic>
            <Magnetic><a className="btn ghost-b" href="#join" onClick={(e) => go(e, '#join')}>{hero.ctaSecondary}</a></Magnetic>
          </div>
          <div className="scroll-cue" aria-hidden="true">
            <span className="cue-track"><i /></span>
            <span className="tag">Scroll</span>
          </div>
        </div>
        <figure className="hero-photo">
          <div className="ph">
            <img
              src={resolveImg(hero.image) || images.hero}
              alt="Children supported by RTG sitting together on steps in Debre Berhan, wearing brightly colored clothes"
              fetchPriority="high"
            />
          </div>
          <div className="seal" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="sealc" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" fill="none" />
              </defs>
              <text><textPath href="#sealc">It concerns me · Det angår mig · Est. 2020 · </textPath></text>
            </svg>
            <span className="am" lang="am">ያ</span>
          </div>
          <figcaption className="cap">
            <b>FIELD —</b>
            <span>{hero.caption}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
