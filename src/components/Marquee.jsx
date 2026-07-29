import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'
import { useContent } from '../lib/content.jsx'

const isEthiopic = (s) => /[ሀ-፿]/.test(s)

const Set = ({ phrases }) => (
  <span className="set">
    {phrases.map((p, i) => (
      <i key={i} style={{ display: 'contents' }}>
        {isEthiopic(p) ? <i className="am" lang="am">{p}</i> : p}
        <i className="dot">✦</i>
      </i>
    ))}
  </span>
)

export default function Marquee() {
  const ref = useRef(null)
  const { settings } = useContent()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const loop = gsap.to('.track', { xPercent: -50, repeat: -1, duration: 28, ease: 'none' })

      /* scroll velocity feeds the belt speed */
      ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(-4, 4, self.getVelocity() / 260)
          gsap.to(loop, {
            timeScale: 1 + Math.abs(boost),
            duration: 0.2,
            overwrite: true,
            onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.2 }),
          })
        },
      })
    },
    { scope: ref },
  )

  return (
    <div className="marq" ref={ref} aria-hidden="true">
      <div className="track"><Set phrases={settings.marquee} /><Set phrases={settings.marquee} /></div>
    </div>
  )
}
