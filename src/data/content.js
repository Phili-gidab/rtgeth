// Single source of truth for site content.
// Sources: rtgeth.org scrape (2026-07-12) + team field notes — see docs/site-audit.md.

import imgHero from '../assets/img/p_0576.jpg'
import imgGroup from '../assets/img/p_0586.jpg'
import imgTent from '../assets/img/p_8.jpg'
import imgShelter from '../assets/img/photo1.jpg'
import imgComp from '../assets/img/p_0523.jpg'
import imgField from '../assets/img/photo3.jpg'
import imgHall from '../assets/img/p_0491.jpg'
/* Gamo highlands (Chencha) — Bernard Gagnon, Wikimedia Commons, CC BY-SA 3.0.
   No openly-licensed photos of the landslide events exist; this depicts the
   affected region, captioned honestly. Keep the credit line wherever used. */
import imgGamo from '../assets/img/gamo-chencha.jpg'
import logo from '../assets/img/logo.png'

export const images = { hero: imgHero, group: imgGroup, atmosphere: imgField, logo }

/* '@key' placeholders in CMS content resolve to these bundled photos */
export const bundledImages = {
  hero: imgHero,
  group: imgGroup,
  tent: imgTent,
  shelter: imgShelter,
  comp: imgComp,
  field: imgField,
  hall: imgHall,
  gamo: imgGamo,
}

export const nav = [
  { href: '#who', label: 'Who we are' },
  { href: '#work', label: 'The work' },
  { href: '#story', label: 'Stories' },
  { href: '#people', label: 'People' },
  { href: '#field', label: 'Field' },
]

export const programs = [
  {
    title: 'Digital classrooms',
    loc: 'Afar Region · with local schools',
    body: "Fully equipped computers, pre-loaded with offline educational material — because a school beyond the reach of the internet shouldn't be beyond the reach of knowledge.",
    met: 'Offline',
    sub: 'first design',
    img: imgComp,
  },
  {
    title: 'Dignity, monthly',
    loc: 'Debre Birhan University',
    body: 'Sanitary-pad support for female students who cannot afford it — so no one misses an exam for being poor.',
    met: 'Every',
    sub: 'month, term-round',
  },
  {
    title: "Girls' library",
    loc: 'Debre Birhan University',
    body: 'An ongoing project with the university to give female students a dedicated library and study space — on the same campus as our monthly dignity program.',
    met: 'New',
    sub: 'ongoing project',
  },
  {
    title: 'School materials',
    loc: 'Shewa Robit',
    body: 'Books, pens and supplies for students whose families and guardians cannot provide them.',
    met: '30+',
    sub: 'students accepted',
    img: imgTent,
  },
  {
    title: 'Youth sports development',
    loc: 'Debre Birhan · with Tesfa Sports Center & local government',
    body: 'We supply the kit, Tesfa supplies the coaches. Two trainees have already advanced to the Addis Ababa Academy — and every year the annual festival brings athletics and football to the whole town.',
    met: '85+',
    sub: 'youths in training',
  },
  {
    title: 'Health insurance',
    loc: 'Addis Ababa',
    body: 'Digital health insurance covering a full year of medical costs for disabled and elderly residents who would otherwise go untreated.',
    met: '50+',
    sub: 'people covered',
  },
  {
    title: 'Emergency relief',
    loc: 'Gamo Zone · landslide response',
    body: 'Direct financial support delivered to families hit by the recent landslide — fast, documented, and in full.',
    met: '500K',
    sub: 'birr delivered',
    img: imgGamo,
  },
  {
    title: 'Single mothers tailoring co-op',
    loc: 'Completed · handed over',
    body: 'Training, machines and a workspace — then the keys. The women now run the workshop themselves. Read the story below.',
    met: '100%',
    sub: 'independently run',
    img: imgGroup,
  },
]

export const workNote =
  'Earlier chapters: IDP relief in Debre Berhan (2022–25), food relief and soft-loan livelihoods for 60 people in Shewa Robit (2022–25), sewing training for 20 women with Muluwengel Church, 30 computers to Shewa-Robit High School with Camara Education (2022–24), technical and material support for Ataye Hospital (2022). Next: the Geferssa water-rehabilitation center and the Wag Himra livelihood project.'

export const stats = [
  { to: 85, suffix: '+', label: ['young athletes', ' equipped and coached in Debre Birhan'] },
  { to: 50, suffix: '+', label: ['disabled & elderly people', ' covered by a year of health insurance'] },
  { to: 500, suffix: 'K', label: ['birr in relief', ' delivered to landslide victims in Gamo'] },
  { to: 130, suffix: '', label: ['children', ' supported monthly through the Grace Children program'] },
  { to: 60, suffix: '', label: ['people', ' supported with food and soft-loan livelihoods in Shewa Robit'] },
  { to: 2, suffix: '', label: ['trainees advanced', ' to the Addis Ababa Academy — so far'] },
]

export const gallery = [
  { src: imgTent, tag: 'Education', place: 'IDP camp, Debre Berhan', cap: 'A classroom in a tent — school goes on, even here.', alt: 'Dozens of displaced children in a tent classroom watching an educational video' },
  { src: imgShelter, tag: 'Relief', place: 'Debre Berhan', cap: 'Families in temporary shelter after displacement.', alt: 'Interior of a temporary shelter for internally displaced families, with children among household belongings' },
  { src: imgComp, tall: true, tag: 'Handover', place: 'Shewa-Robit High School', cap: 'Thirty computers, delivered and signed for.', alt: 'RTG country director handing a donated computer to a school representative under a banner in Amharic' },
  { src: imgField, tall: true, tag: 'On the ground', place: 'IDP camp, Debre Berhan', cap: 'Coordinating aid inside the camp.', alt: 'A humanitarian field worker speaking inside a shelter tent full of children' },
  { src: imgHall, tag: 'Assembly', place: 'North Shewa', cap: 'The community decides with us, not after us.', alt: 'Community members seated in a hall during an RTG assembly meeting' },
  { src: imgHero, tag: 'Support', place: 'Debre Berhan', cap: 'War orphans receiving school materials.', alt: 'Children supported by RTG sitting together on steps, wearing brightly colored clothes' },
  { src: imgGamo, tag: 'Emergency', place: 'Gamo highlands', cap: 'The highlands where the landslides struck — RTG sent 500,000 birr. Photo: Bernard Gagnon, CC BY-SA 3.0.', alt: 'A dirt road winding through a green highland village in the Gamo zone of southern Ethiopia' },
]

export const people = [
  { name: 'Dawit Bekele, MD', role: 'Chairman, Global', bio: 'Emergency physician in Umeå. Founded the Grace Children sponsorship — ~130 children supported monthly since the early 2000s.' },
  { name: 'Lemma Degefa, PhD', role: 'Country Director, Ethiopia', bio: '35 years in development; 25 with the Lutheran World Federation across Africa and Geneva, incl. LWF Ethiopia Country Director.' },
  { name: 'Teklesellassie Terefe', role: 'Secretary', bio: 'Engineer, teacher, workshop head — the operational memory of the organization.' },
  { name: 'Etsegenet Admassu, MD', role: 'Treasurer', bio: 'Physician, Jimma Medical School; a career serving low-income families.' },
  { name: 'Agonafer Tekalign, MD MPH', role: 'Board Member', bio: 'Four decades in public health; Country Director, Malaria Consortium Ethiopia; President, Ethiopian Public Health Association.' },
  { name: 'Getachew Zergaw, PhD', role: 'Board Member', bio: 'Mathematician and educator; former senior lecturer at London universities.' },
]

export const facts = [
  ['Initiated', '2021 · by the Ethiopian diaspora in Scandinavia'],
  ['Registered', 'Sweden · Jan 2022 (org. nr 802538-0992) · Ethiopia · May 2022'],
  ['Structure', 'Volunteer-run · 7-member board · General Assembly'],
  ['Offices', 'Umeå, Sweden · Bole, Addis Ababa'],
  ['Four pillars', 'Education · Health · Livelihood · Emergency response'],
  ['Working areas', 'North Shewa · Afar · Addis Ababa · Gamo'],
]

export const geez = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱']

/* Suggested transfer amounts. Notes are behavioral, not outcome claims —
   real impact equivalences must come from the team's program budgets. */
export const tiers = [
  { amount: '500', unit: 'birr', ref: 'GENERAL', note: 'Many gifts start here' },
  { amount: '1,500', unit: 'birr', ref: 'GENERAL', note: 'The most common gift', hot: true },
  { amount: '5,000', unit: 'birr', ref: 'GAMO', note: 'Goes to emergency relief' },
  { amount: 'Yours', unit: '', ref: 'ASK', note: 'Write us — we will tell you precisely what it does' },
]

export const bank = [
  { label: 'Bank', value: 'Berhan Bank S.C.', copy: false },
  { label: 'SWIFT', value: 'BERHETAA', copy: true },
  { label: 'Account', value: '250 168011 8125', copy: true },
]

export const faqs = [
  {
    q: 'How do I know my transfer arrived?',
    a: 'Email us your transfer reference at info@rtgeth.org after you give. We confirm receipt personally, and later send a thank-you with a photo update from the program your gift funded.',
  },
  {
    q: 'Who runs RTG — and are you paid?',
    a: 'RTG is volunteer-run. The board — emergency physicians, public-health directors, development practitioners — serves three-year terms without salary. Donations fund field programs, not wages.',
  },
  {
    q: 'Are you a registered organization?',
    a: 'Yes — in both countries. RTG is a registered Swedish non-profit (January 2022, org. nr 802538-0992, Umeå) and a legally registered organization in Ethiopia (May 2022), operating through our country office in Bole, Addis Ababa, led by a former Lutheran World Federation country director.',
  },
  {
    q: 'Can I give from outside Ethiopia?',
    a: 'Yes — international transfers reach us through SWIFT code BERHETAA at Berhan Bank. Gifts in SEK, EUR, USD or GBP are all welcome. Swedish donors can also reach our Umeå office directly.',
  },
  {
    q: 'What does RTG need most right now?',
    a: 'Monthly members — steady income is what lets us commit to a school year, not just a delivery. Right now the Gamo landslide response also needs one-time gifts, and in-kind goods (tents, mattresses, hygiene kits) are always welcome.',
  },
  {
    q: 'Can I volunteer without being in Ethiopia?',
    a: 'Yes. RTG is a worldwide association of volunteers — medics and first responders are the most urgent need on the ground, but design, logistics, translation and fundraising all carry from anywhere. Write to info@rtgeth.org.',
  },
]

export const partners = [
  'Debre Birhan University',
  'Tesfa Sports Center',
  'Camara Education',
  'Muluwengel Church',
  'Serve Global',
  'Love The Children',
  'Addis Amba',
  'AGEZ',
  'Petros Development',
  'Derash',
]
