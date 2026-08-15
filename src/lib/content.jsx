/*
 * Site content layer. Fetches the CMS bundle from the API and merges it
 * over the bundled defaults (GSTS pattern: the site renders fully even if
 * the API is down or empty — CMS data upgrades it in place).
 * Image values: '@key' → bundled photo, '/uploads/…' → API-hosted upload.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as defaults from '../data/content'

const API = import.meta.env.VITE_API_URL || ''

export const resolveImg = (val) => {
  if (!val) return null
  if (typeof val !== 'string') return val
  if (val.startsWith('@')) return defaults.bundledImages[val.slice(1)] || null
  if (val.startsWith('/uploads/')) return `${API}${val}`
  return val
}

const defaultSingles = {
  hero: {
    kicker: 'Rescue The Generation · Umeå ↔ Addis Ababa · Est. 2021',
    titleLines: ['It', 'Concerns', 'Me.'],
    sub: 'Yagebanal. The word our founders chose. It means the hunger of a stranger is my business. We are a volunteer-run Ethiopian charity, founded by the diaspora in Sweden, working where the need is greatest — one school, one mother, one generation at a time.',
    ctaPrimary: 'Donate now',
    ctaSecondary: 'Become a member — from 100 birr/mo',
    image: '@hero',
    caption: 'School-material distribution to war orphans · Debre Berhan, Amhara',
  },
  who: {
    lede: 'Initiated in 2021 by Ethiopian doctors, engineers and teachers living in Scandinavia — and registered in both Sweden and Ethiopia in 2022 — RTG moves resources from those who left to those who stayed.',
    body1: 'We are non-profit, non-political and autonomous. Our board members are emergency physicians, public-health directors and development practitioners with decades in the field — people who know that in a crisis, time is life.',
    body2: 'We respond to emergencies, confront the roots of poverty and violence against women and children, stand with children with special needs, and work for healing and reconciliation — including people living with post-traumatic stress. And because trust is our only currency, we publish what we do, where, and what it cost.',
    facts: defaults.facts,
    workNote: defaults.workNote,
  },
  story: {
    tag: 'Single mothers tailoring project · Completed',
    quoteLines: ['The machines', 'are |theirs| now.'],
    body1: 'A group of single mothers. A hired trainer. Sewing machines and materials bought, a workspace facilitated by the local government. Months of training.',
    body2: "Then the part that matters: the handover. The machines were formally given to the women — and today they manufacture women's clothing and undergarments, run their own orders, and answer to no one but each other.",
    body3: "Our job was to leave. That's what rescue looks like.",
    steps: [
      'Trainer hired, machines & materials purchased',
      'Workspace facilitated by local government',
      'Training completed · machines handed over',
      "Production running — women's clothing & undergarments",
    ],
    image: '@group',
    caption: 'Beneficiary families of RTG livelihood programs · North Shewa',
  },
  join: {
    memberTitle: 'Join the |ያገባኛል| circle',
    memberFee: '100 birr',
    memberFeeSub: '≈ 100 SEK/NOK · €10 · $10 · £10 / month',
    memberBody: 'Members are the people who said "it concerns me" — every month. Steady income is what lets us commit to a school year, not just a delivery. Open to everyone 18+, with a vote in the General Assembly.',
    volunteerBody: 'RTG is a worldwide association of volunteers — members pledge 5–10 working days a year. First responders and medical doctors are especially needed in emergency areas, but every skill carries, from anywhere.',
    donateTitle: 'Give — and hear back',
    inKindNote: 'In-kind counts too — tents, mattresses, hygiene kits. A single mattress can protect a family of four.',
    step3: "Email us your transfer reference. We confirm receipt personally — and later send a thank-you with a photo update from the program your gift funded. That's the receipt a bank can't give you.",
    bank: defaults.bank,
  },
  settings: {
    ribbonOn: true,
    ribbonLabel: 'Urgent · July 2026',
    ribbonText: 'Gamo landslide response — 500,000 birr committed to affected families. Help us reach more.',
    ribbonCta: 'Give now →',
    campaignOn: true,
    campaignLabel: 'Gamo landslide response',
    payChapa: true,
    payCard: false,
    payPaypal: false,
    marquee: ['ያገባኛል', 'It concerns me', 'Concerned and involved', 'Det angår mig', 'I am responsible'],
    clarity: 'RTG is volunteer-run — the board serves unpaid, and no salaries are drawn from donations. Registered non-profit in Sweden (Jan 2022, org. nr 802538-0992) and Ethiopia (May 2022), with a country office in Addis Ababa.',
    email: 'info@rtgeth.org',
    officeSweden: 'Triangelgatan 21\n907 52 Umeå, Sweden\n+46 702 370 239',
    officeEthiopia: 'Bole Subcity, Woreda 14\nAddis Ababa, Ethiopia\n+251 911 412 453',
    regNo: 'Org. nr 802538-0992',
  },
  headings: {
    whoTitle: 'A bridge, not a headquarters',
    whoTag: 'Who we are',
    workTitle: 'The work, right now',
    workTag: 'Programs · 2025–26',
    workCompletedLabel: 'Completed chapters — delivered and closed',
    proofTitle: 'We count what we do',
    proofTag: 'Receipts, not promises · as of July 2026',
    fieldTitle: 'From the field',
    fieldTagScroll: 'Unstaged · scroll to travel →',
    fieldTagGrid: 'Unstaged · as we found it',
    peopleTitle: 'The people answerable',
    peopleTag: 'Executive committee · 3-year terms',
    joinTitle: 'Take your part',
    joinTag: 'Member · Volunteer · Donor',
    faqTitle: 'Fair questions',
    faqTag: 'Before you give',
    updatesTitle: 'Field updates',
    updatesTag: 'Notes from the ground',
    footTranslation: 'It concerns me · I am responsible',
    footLegal: '© 2026 Rescue The Generation · Non-profit, non-political, autonomous',
    footNewsNote: 'Field updates — a few emails a year, always with photos.',
    navItems: defaults.nav.map((n) => ({ label: n.label, href: n.href })),
  },
}

const defaultCollections = {
  programs: defaults.programs,
  stats: defaults.stats.map((s) => ({ to: s.to, suffix: s.suffix, strong: s.label[0], rest: s.label[1] })),
  gallery: defaults.gallery,
  people: defaults.people,
  faqs: defaults.faqs,
  partners: defaults.partners.map((name) => ({ name })),
  tiers: defaults.tiers,
  updates: [],
}

function buildView(remote) {
  const singles = {}
  for (const key of Object.keys(defaultSingles)) {
    singles[key] = { ...defaultSingles[key], ...(remote?.singles?.[key] || {}) }
  }
  const collections = {}
  for (const key of Object.keys(defaultCollections)) {
    const rows = remote?.collections?.[key]
    collections[key] = Array.isArray(rows) && rows.length ? rows : defaultCollections[key]
  }
  return { ...singles, ...collections, live: !!remote }
}

const ContentCtx = createContext(buildView(null))

export function ContentProvider({ children }) {
  const [remote, setRemote] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${API}/api/content`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setRemote(data))
      .catch(() => {}) /* offline/API-less: defaults carry the site */
    return () => ctrl.abort()
  }, [])

  const view = useMemo(() => buildView(remote), [remote])
  return <ContentCtx.Provider value={view}>{children}</ContentCtx.Provider>
}

export const useContent = () => useContext(ContentCtx)
