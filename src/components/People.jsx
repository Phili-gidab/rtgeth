import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { useContent } from '../lib/content.jsx'

export default function People() {
  const { people } = useContent()
  return (
    <section className="blk" id="people" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[5]} title="The people answerable" tag="Executive committee · 3-year terms" />
        <div className="people">
          {people.map((p, i) => (
            <div className="prow" data-rev key={p.name}>
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.name}</h3>
              <span className="role">{p.role}</span>
              <p>{p.bio}</p>
            </div>
          ))}
        </div>
        <div className="people-quote" data-rev>
          <span className="mark" aria-hidden="true">"</span>
          <blockquote>
            Time is life. When a family is displaced, the response cannot wait for a committee.
            <cite>— Dawit Bekele, MD · Chairman</cite>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
