import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { prefersReducedMotion } from '../lib/scroll'
import { useContent, resolveImg } from '../lib/content.jsx'

/* one ledger row — numbering runs continuously across the ongoing/completed groups */
function Row({ p, i }) {
  return (
    <div className="lrow" data-img={resolveImg(p.img) || undefined}>
      <span className="idx">{String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3>{p.title}</h3>
        <span className="loc">{p.loc}</span>
      </div>
      <p>{p.body}</p>
      <div className="met">{p.met}<small>{p.sub}</small></div>
    </div>
  )
}

export default function Work() {
  const ref = useRef(null)
  const { programs, who, headings } = useContent()
  const ongoing = programs.filter((p) => !p.done)
  const completed = programs.filter((p) => p.done)
  const floatRef = useRef(null)
  const floatImgRef = useRef(null)

  /* each ledger row: hairline draws, content rises */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray('.lrow').forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 90%', once: true },
        })
        tl.from(row, { '--rule': 0, duration: 1, ease: 'power3.inOut' }, 0)
          .from(row.children, {
            autoAlpha: 0, y: 22, duration: 0.7, stagger: 0.07, ease: 'power3.out',
          }, 0.1)
      })
    },
    { scope: ref },
  )

  /* floating photo preview follows the cursor over rows that have one.
     Visibility is decided on EVERY pointermove + scroll tick — enter/leave
     pairs miss the row scrolling out from under a stationary cursor. */
  useGSAP(
    () => {
      if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return
      const float = floatRef.current
      const xTo = gsap.quickTo(float, 'x', { duration: 0.45, ease: 'power3.out' })
      const yTo = gsap.quickTo(float, 'y', { duration: 0.45, ease: 'power3.out' })
      let visible = false

      const show = () => {
        if (visible) return
        visible = true
        gsap.to(float, { autoAlpha: 1, scale: 1, rotate: -3, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
      }
      const hide = () => {
        if (!visible) return
        visible = false
        gsap.to(float, { autoAlpha: 0, scale: 0.85, rotate: 3, duration: 0.25, ease: 'power3.in', overwrite: 'auto' })
      }
      const onMove = (e) => {
        const row = e.target.closest?.('.lrow[data-img]')
        if (row) {
          const src = row.dataset.img
          if (floatImgRef.current.getAttribute('src') !== src) floatImgRef.current.src = src
          xTo(e.clientX)
          yTo(e.clientY)
          show()
        } else {
          hide()
        }
      }

      document.addEventListener('pointermove', onMove, { passive: true })
      addEventListener('scroll', hide, { passive: true })
      gsap.set(float, { autoAlpha: 0, scale: 0.85, xPercent: 6, yPercent: -50 })
      return () => {
        document.removeEventListener('pointermove', onMove)
        removeEventListener('scroll', hide)
      }
    },
    { scope: ref },
  )

  return (
    <section className="blk" id="work" style={{ paddingTop: 0 }} ref={ref}>
      <div className="wrap">
        <SectionHead num={geez[1]} title={headings.workTitle} tag={headings.workTag} />
        <div className="ledger">
          {ongoing.map((p, i) => <Row p={p} i={i} key={p.id ?? `${p.title}-${i}`} />)}
        </div>
        {completed.length > 0 && (
          <>
            <p className="ledger-divider" data-rev>{headings.workCompletedLabel}</p>
            <div className="ledger">
              {completed.map((p, i) => <Row p={p} i={ongoing.length + i} key={p.id ?? `${p.title}-${i}`} />)}
            </div>
          </>
        )}
        <p className="work-note" data-rev>{who.workNote}</p>
      </div>
      <div className="lrow-float" ref={floatRef} aria-hidden="true">
        <img ref={floatImgRef} alt="" />
      </div>
    </section>
  )
}
