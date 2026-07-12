import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../lib/scroll'

/* Section header: Ge'ez numeral pops, title rises out of a mask, hairline draws across. */
export default function SectionHead({ num, title, tag }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        scrollTrigger: { trigger: ref.current, start: 'top 86%', once: true },
      })
      tl.from(ref.current, { '--rule': 0, duration: 1.1, ease: 'power3.inOut' }, 0)
        .from('.snum', { scale: 0, rotate: -30, duration: 0.6, ease: 'back.out(2.2)' }, 0.1)
        .from('.shead-mask i', { yPercent: 110, duration: 0.9 }, 0.15)
        .from('.tag', { autoAlpha: 0, x: 16, duration: 0.6 }, 0.4)
    },
    { scope: ref },
  )

  return (
    <div className="shead shead-anim" ref={ref}>
      <span className="snum" lang="am">{num}</span>
      <h2><span className="shead-mask"><i>{title}</i></span></h2>
      <span className="tag">{tag}</span>
    </div>
  )
}
