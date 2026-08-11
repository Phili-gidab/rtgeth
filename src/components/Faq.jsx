import SectionHead from './SectionHead'
import { geez } from '../data/content'
import { useContent } from '../lib/content.jsx'

export default function Faq() {
  const { faqs, headings } = useContent()
  return (
    <section className="blk" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <SectionHead num={geez[7]} title={headings.faqTitle} tag={headings.faqTag} />
        <div className="faq" data-rev>
          {faqs.map((f, i) => (
            <details key={f.id ?? `${f.q}-${i}`}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
