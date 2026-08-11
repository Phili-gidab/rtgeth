import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { getLenis, scrollToHash, prefersReducedMotion } from '../lib/scroll'
import { useContent, resolveImg } from '../lib/content.jsx'

/* vertical offsets that stagger frames off the centreline, like prints on a studio wall */
const DRIFT = [0, 44, -38, 26, -48, 32]

function Frame({ item, index, onOpen }) {
  return (
    <figure className={`film-frame${item.tall ? ' tall' : ''}`} style={{ '--drift': `${DRIFT[index % DRIFT.length]}px` }}>
      <span className="film-idx" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <button type="button" className="film-ph" onClick={() => onOpen(index)} aria-label={`Open photo: ${item.tag} — ${item.place}`}>
        <img src={resolveImg(item.src)} alt={item.alt || `${item.tag} — ${item.place}`} loading="lazy" draggable="false" />
        <span className="film-veil">
          <b>{item.tag}</b>
          <span>{item.place}</span>
        </span>
      </button>
    </figure>
  )
}

/*
 * From the field — a pinned cinematic filmstrip on desktop: vertical scroll
 * drives the strip horizontally past a giant ghost ያገባኛል, ending on a CTA
 * panel. Falls back to a two-column grid on touch/small screens and under
 * reduced motion. Every frame opens an accessible <dialog> lightbox.
 */
export default function Field() {
  const { gallery } = useContent()
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const horizontal = wide && !prefersReducedMotion()

  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const ghostRef = useRef(null)
  const barRef = useRef(null)
  const counterRef = useRef(null)
  const dialogRef = useRef(null)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => setWide(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useGSAP(
    () => {
      if (!horizontal) return
      const track = trackRef.current
      const dist = () => track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`
            if (counterRef.current) {
              const n = Math.max(1, Math.min(gallery.length, Math.ceil(self.progress * gallery.length)))
              counterRef.current.textContent = String(n).padStart(2, '0')
            }
          },
        },
      })

      /* ghost word drifts slower, for depth */
      gsap.to(ghostRef.current, {
        x: () => -dist() * 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          scrub: 1,
        },
      })
    },
    { dependencies: [horizontal], revertOnUpdate: true },
  )

  const openAt = (i) => {
    setCurrent(i)
    dialogRef.current?.showModal()
    getLenis()?.stop()
  }
  const closeBox = () => dialogRef.current?.close()
  const step = (dir) => setCurrent((c) => (c === null ? c : (c + dir + gallery.length) % gallery.length))
  const item = current !== null ? gallery[current] : null

  const go = (e, href) => { e.preventDefault(); scrollToHash(href) }

  return (
    <section className="blk field" id="field" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[4]} title="From the field" tag={horizontal ? 'Unstaged · scroll to travel →' : 'Unstaged · as we found it'} />
      </div>

      {horizontal ? (
        <div className="film" ref={rootRef}>
          <div className="film-ghost am" lang="am" ref={ghostRef} aria-hidden="true">ያገባኛል</div>
          <div className="film-track" ref={trackRef}>
            {gallery.map((g, i) => (
              <Frame key={g.id ?? `${g.cap}-${i}`} item={g} index={i} onOpen={openAt} />
            ))}
            <div className="film-outro">
              <p className="fo-title">The next photo could be <span>your doing.</span></p>
              <p className="fo-sub">Every frame here began with one person deciding it concerned them.</p>
              <a className="btn solid" href="#join" onClick={(e) => go(e, '#join')}>Take your part</a>
            </div>
          </div>
          <div className="film-rail">
            <span className="film-count"><b ref={counterRef}>01</b> / {String(gallery.length).padStart(2, '0')}</span>
            <div className="film-bar"><i ref={barRef} /></div>
          </div>
        </div>
      ) : (
        <div className="wrap gal-grid">
          {gallery.map((g, i) => (
            <figure key={g.id ?? `${g.cap}-${i}`} data-rev>
              <button type="button" className="film-ph" onClick={() => openAt(i)} aria-label={`Open photo: ${g.tag} — ${g.place}`}>
                <img src={resolveImg(g.src)} alt={g.alt || `${g.tag} — ${g.place}`} loading="lazy" />
              </button>
              <figcaption><b>{g.tag} —</b><span>{g.cap}</span></figcaption>
            </figure>
          ))}
        </div>
      )}

      <dialog
        className="lightbox"
        ref={dialogRef}
        onClose={() => { setCurrent(null); getLenis()?.start() }}
        onClick={(e) => e.target === dialogRef.current && closeBox()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        aria-label={item ? `${item.tag} — ${item.place}` : 'Photo viewer'}
      >
        {item && (
          <div className="lb-in">
            <div className="lb-img">
              <img src={resolveImg(item.src)} alt={item.alt || `${item.tag} — ${item.place}`} />
              <button type="button" className="lb-close" onClick={closeBox} aria-label="Close photo viewer">✕</button>
            </div>
            <div className="lb-meta">
              <div className="lb-cap">
                <b>{item.tag}<span> · {item.place}</span></b>
                <p>{item.cap}</p>
              </div>
              <span className="lb-count">{String(current + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}</span>
              <div className="lb-nav">
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo">←</button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo">→</button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
