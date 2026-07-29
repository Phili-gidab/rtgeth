import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { useContent } from '../lib/content.jsx'

export default function Faq() {
  const { faqs } = useContent()
  return (
    <section className="blk" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[7]} title="Fair questions" tag="Before you give" />
        <div className="faq" data-rev>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
