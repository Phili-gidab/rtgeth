import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { useContent, resolveImg } from '../lib/content.jsx'

/* Field updates — appears only once the team publishes its first note in the CMS. */
export default function Updates() {
  const { updates, headings } = useContent()
  if (!updates.length) return null
  return (
    <section className="blk" id="updates" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[8]} title={headings.updatesTitle} tag={headings.updatesTag} />
        <div className="updates">
          {updates.map((u, i) => (
            <article className="ucard" data-rev data-d={(i % 3) * 0.08} key={u.id ?? `${u.title}-${i}`}>
              {resolveImg(u.img) && (
                <div className="ucard-ph"><img src={resolveImg(u.img)} alt={u.title} loading="lazy" /></div>
              )}
              {u.date && <span className="tag">{u.date}</span>}
              <h3>{u.title}</h3>
              {u.body && <p>{u.body}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
