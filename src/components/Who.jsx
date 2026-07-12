import SectionHead from './SectionHead'
import { facts, partners, geez } from '../data/content'

export default function Who() {
  return (
    <section className="blk" id="who">
      <div className="wrap">
        <SectionHead num={geez[0]} title="A bridge, not a headquarters" tag="Who we are" />
        <div className="who-grid">
          <div data-rev>
            <p className="lede">
              Founded in 2020 by Ethiopian doctors, engineers and teachers living in Scandinavia,
              RTG moves resources from those who left to those who stayed.
            </p>
            <div className="who-body">
              <p>
                We are non-profit, non-political and autonomous. Our board members are emergency physicians,
                public-health directors and development practitioners with decades in the field — people who
                know that in a crisis, <strong>time is life</strong>.
              </p>
              <p>
                We respond to emergencies, confront the roots of poverty and violence against women and
                children, and stand with children with special needs. And because trust is our only currency,
                <strong> we publish what we do, where, and what it cost.</strong>
              </p>
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
            {facts.map(([k, v]) => (
              <div className="frow" key={k}><b>{k}</b><span>{v}</span></div>
            ))}
          </aside>
        </div>
        <div className="partners" data-rev>
          <span className="tag">Working with</span>
          <ul>
            {partners.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
