import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { useContent } from '../lib/content.jsx'

export default function Who() {
  const { who, partners, headings } = useContent()
  return (
    <section className="blk" id="who">
      <div className="wrap">
        <SectionHead num={geez[0]} title={headings.whoTitle} tag={headings.whoTag} />
        <div className="who-grid">
          <div data-rev>
            <p className="lede">{who.lede}</p>
            <div className="who-body">
              <p>{who.body1}</p>
              <p>{who.body2}</p>
            </div>
            <div className="bridge">
              <span>Umeå 63.8°N</span><span className="ln" /><span>Addis Ababa 9.0°N</span>
            </div>
            <ul className="values" aria-label="IMPACT values">
              <li><b>I</b>ntegrity</li>
              <li><b>M</b>ission-driven</li>
              <li><b>P</b>artnership</li>
              <li><b>A</b>ccountability</li>
              <li><b>C</b>ompassion</li>
              <li><b>T</b>eamwork</li>
            </ul>
          </div>
          <aside className="facts" data-rev data-d="0.15" aria-label="Organization facts">
            {(who.facts || []).map(([k, v]) => (
              <div className="frow" key={k}><b>{k}</b><span>{v}</span></div>
            ))}
          </aside>
        </div>
        <div className="partners" data-rev>
          <span className="tag">Working with</span>
          <ul>
            {partners.map((p, i) => <li key={p.id ?? `${p.name}-${i}`}>{p.name}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
