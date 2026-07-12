import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'

const Set = () => (
  <span className="set">
    <i className="am" lang="am">ያገባኛል</i><i className="dot">✦</i>
    It concerns me<i className="dot">✦</i>
    Det angår mig<i className="dot">✦</i>
    I am responsible<i className="dot">✦</i>
  </span>
)

export default function Marquee() {
  const ref = useRef(null)

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
      <div className="track"><Set /><Set /></div>
    </div>
  )
}
