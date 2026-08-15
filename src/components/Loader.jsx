import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'

export default function Loader({ onDone }) {
  const ref = useRef(null)
  const [gone, setGone] = useState(false)
  const reduce = typeof window !== 'undefined' && prefersReducedMotion()

  useEffect(() => {
    if (reduce) {
      onDone()
      setGone(true)
    }
  }, [reduce, onDone])

  useGSAP(
    () => {
      if (reduce) return
      const tl = gsap.timeline({
        onComplete: () => setGone(true),
      })
      tl.from('.loader .am', { autoAlpha: 0, y: 26, duration: 0.55, ease: 'power3.out' }, 0.1)
        .from('.loader .lt', { autoAlpha: 0, y: 12, duration: 0.45, ease: 'power3.out' }, 0.5)
        .add(() => onDone(), 1.15)
        .to(ref.current, { yPercent: -101, duration: 0.75, ease: 'power4.inOut' }, 1.2)
    },
    { scope: ref },
  )

  if (gone) return null
  return (
    <div className="loader" ref={ref} aria-hidden="true">
      <div className="am" lang="am">ይመለከተኛል</div>
      <div className="lt">It concerns me · Det angår mig</div>
    </div>
  )
}
