import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SectionHead from './SectionHead'
import { images, geez } from '../data/content'
import { prefersReducedMotion } from '../lib/scroll'

export default function Story() {
  const ref = useRef(null)

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
        <SectionHead num={geez[3]} title="Field report" tag="Single mothers tailoring project · Completed" />
        <div className="story-grid">
          <div>
            <p className="story-quote">
              <span className="qrow"><i>The machines</i></span>
              <span className="qrow"><i>are <span className="red">theirs</span> now.</i></span>
            </p>
            <div className="story-body" data-rev>
              <p>
                A group of single mothers. A hired trainer. Sewing machines and materials bought,
                a workspace facilitated by the local government. Months of training.
              </p>
              <p>
                Then the part that matters: <strong>the handover.</strong> The machines were formally
                given to the women — and today they manufacture women's clothing and undergarments,
                run their own orders, and answer to no one but each other.
              </p>
              <p><strong>Our job was to leave.</strong> That's what rescue looks like.</p>
            </div>
            <ol className="story-steps" aria-label="Project timeline" data-rev data-d="0.1">
              <li><span className="am" lang="am">፩</span>Trainer hired, machines &amp; materials purchased</li>
              <li><span className="am" lang="am">፪</span>Workspace facilitated by local government</li>
              <li><span className="am" lang="am">፫</span>Training completed · machines handed over</li>
              <li><span className="am" lang="am">፬</span>Production running — women's clothing &amp; undergarments</li>
            </ol>
          </div>
          <figure className="story-photo">
            <div className="ph" data-clip>
              <img
                src={images.group}
                alt="Women and families supported by RTG's livelihood programs standing together outside a community building"
              />
            </div>
            <figcaption className="cap">
              <b>LIVELIHOOD —</b>
              <span>Beneficiary families of RTG livelihood programs · North Shewa</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
