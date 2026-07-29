import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SectionHead from './SectionHead'
import { images, geez } from '../data/content'
import { prefersReducedMotion } from '../lib/scroll'
import { useContent, resolveImg } from '../lib/content.jsx'

/* "are |theirs| now." → the |…| chunk gets the red accent */
const QuoteLine = ({ text }) =>
  String(text).split('|').map((part, i) => (i % 2 ? <span className="red" key={i}>{part}</span> : part))

export default function Story() {
  const ref = useRef(null)
  const { story } = useContent()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      /* quote lines rise from masks */
      gsap.from('.story-quote .qrow i', {
        yPercent: 112,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.story-quote', start: 'top 82%', once: true },
      })
      /* photo drifts slower than the page */
      gsap.fromTo(
        '.story-photo img',
        { yPercent: -9, scale: 1.12 },
        {
          yPercent: 9,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        },
      )
    },
    { scope: ref },
  )

  return (
    <section className="blk story" id="story" ref={ref}>
      <div className="wrap">
        <SectionHead num={geez[3]} title="Field report" tag={story.tag} />
        <div className="story-grid">
          <div>
            <p className="story-quote">
              {(story.quoteLines || []).map((line, i) => (
                <span className="qrow" key={i}><i><QuoteLine text={line} /></i></span>
              ))}
            </p>
            <div className="story-body" data-rev>
              <p>{story.body1}</p>
              <p>{story.body2}</p>
              <p><strong>{story.body3}</strong></p>
            </div>
            <ol className="story-steps" aria-label="Project timeline" data-rev data-d="0.1">
              {(story.steps || []).map((step, i) => (
                <li key={i}><span className="am" lang="am">{geez[i] || '·'}</span>{step}</li>
              ))}
            </ol>
          </div>
          <figure className="story-photo">
            <div className="ph" data-clip>
              <img
                src={resolveImg(story.image) || images.group}
                alt="Women and families supported by RTG's livelihood programs standing together outside a community building"
              />
            </div>
            <figcaption className="cap">
              <b>LIVELIHOOD —</b>
              <span>{story.caption}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
