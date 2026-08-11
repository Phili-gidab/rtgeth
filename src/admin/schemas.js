/*
 * The CMS registry — GSTS's navItems pattern, upgraded: one entry here
 * provisions a whole editable section (sidebar item + form + API wiring).
 * Field types: text, textarea, image, toggle, number, list (of strings),
 * pairs (label/value rows), rows (array of objects with sub-fields).
 */

export const SINGLETONS = [
  {
    key: 'hero',
    label: 'Hero',
    icon: '፩',
    fields: [
      { name: 'kicker', label: 'Kicker line', type: 'text' },
      { name: 'titleLines', label: 'Headline lines (3)', type: 'list' },
      { name: 'sub', label: 'Intro paragraph', type: 'textarea' },
      { name: 'ctaPrimary', label: 'Primary button', type: 'text' },
      { name: 'ctaSecondary', label: 'Secondary button', type: 'text' },
      { name: 'image', label: 'Photo', type: 'image' },
      { name: 'caption', label: 'Photo caption', type: 'text' },
    ],
  },
  {
    key: 'who',
    label: 'Who we are',
    icon: '፪',
    fields: [
      { name: 'lede', label: 'Lede', type: 'textarea' },
      { name: 'body1', label: 'Paragraph 1', type: 'textarea' },
      { name: 'body2', label: 'Paragraph 2', type: 'textarea' },
      { name: 'facts', label: 'Facts card (label / value)', type: 'pairs' },
      { name: 'workNote', label: 'Earlier-chapters note (under programs)', type: 'textarea' },
    ],
  },
  {
    key: 'story',
    label: 'Field report',
    icon: '፬',
    fields: [
      { name: 'tag', label: 'Section tag', type: 'text' },
      { name: 'quoteLines', label: 'Big quote lines (|word| = red)', type: 'list' },
      { name: 'body1', label: 'Paragraph 1', type: 'textarea' },
      { name: 'body2', label: 'Paragraph 2', type: 'textarea' },
      { name: 'body3', label: 'Paragraph 3', type: 'textarea' },
      { name: 'steps', label: 'Timeline steps', type: 'list' },
      { name: 'image', label: 'Photo', type: 'image' },
      { name: 'caption', label: 'Photo caption', type: 'text' },
    ],
  },
  {
    key: 'join',
    label: 'Join & donate',
    icon: '፯',
    fields: [
      { name: 'memberTitle', label: 'Membership title', type: 'text' },
      { name: 'memberFee', label: 'Fee', type: 'text' },
      { name: 'memberFeeSub', label: 'Fee subtitle', type: 'text' },
      { name: 'memberBody', label: 'Membership text', type: 'textarea' },
      { name: 'volunteerBody', label: 'Volunteering text', type: 'textarea' },
      { name: 'donateTitle', label: 'Donation panel title', type: 'text' },
      { name: 'inKindNote', label: 'In-kind note', type: 'textarea' },
      { name: 'step3', label: 'Step 3 text', type: 'textarea' },
      { name: 'bank', label: 'Bank rows', type: 'rows', columns: [
        { name: 'label', label: 'Label' }, { name: 'value', label: 'Value' },
      ]},
    ],
  },
  {
    key: 'settings',
    label: 'Site settings',
    icon: '⚙',
    fields: [
      { name: 'ribbonOn', label: 'Emergency ribbon visible', type: 'toggle' },
      { name: 'ribbonLabel', label: 'Ribbon label (URGENT · …)', type: 'text' },
      { name: 'ribbonText', label: 'Ribbon text', type: 'text' },
      { name: 'ribbonCta', label: 'Ribbon link text', type: 'text' },
      { name: 'campaignOn', label: 'Active campaign shown in the donation form', type: 'toggle' },
      { name: 'campaignLabel', label: 'Campaign name (donation dropdown + thank-you page)', type: 'text' },
      { name: 'marquee', label: 'Marquee phrases', type: 'list' },
      { name: 'clarity', label: '"Where the money goes" statement', type: 'textarea' },
      { name: 'email', label: 'Contact email', type: 'text' },
      { name: 'officeSweden', label: 'Sweden office (multiline)', type: 'textarea' },
      { name: 'officeEthiopia', label: 'Ethiopia office (multiline)', type: 'textarea' },
      { name: 'regNo', label: 'Registration number', type: 'text' },
    ],
  },
]

export const COLLECTIONS = [
  {
    key: 'programs',
    label: 'Programs',
    icon: '▤',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Program name', type: 'text', required: true },
      { name: 'loc', label: 'Location · partners', type: 'text' },
      { name: 'body', label: 'Description', type: 'textarea' },
      { name: 'met', label: 'Big metric (e.g. 85+)', type: 'text' },
      { name: 'sub', label: 'Metric caption', type: 'text' },
      { name: 'img', label: 'Hover photo', type: 'image' },
    ],
  },
  {
    key: 'stats',
    label: 'Impact numbers',
    icon: '#',
    titleField: 'strong',
    fields: [
      { name: 'to', label: 'Number (counts up)', type: 'number', required: true },
      { name: 'suffix', label: 'Suffix (+, K, empty)', type: 'text' },
      { name: 'strong', label: 'Bold phrase', type: 'text', required: true },
      { name: 'rest', label: 'Rest of sentence', type: 'text' },
    ],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: '▣',
    titleField: 'cap',
    fields: [
      { name: 'src', label: 'Photo', type: 'image', required: true },
      { name: 'tag', label: 'Tag (Education, Relief…)', type: 'text', required: true },
      { name: 'place', label: 'Place', type: 'text' },
      { name: 'cap', label: 'Caption', type: 'text', required: true },
      { name: 'alt', label: 'Alt text (describes the photo for screen readers)', type: 'text' },
      { name: 'tall', label: 'Tall (portrait crop)', type: 'toggle' },
    ],
  },
  {
    key: 'people',
    label: 'Board members',
    icon: '؎',
    titleField: 'name',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'bio', label: 'One-line bio', type: 'textarea' },
    ],
  },
  {
    key: 'faqs',
    label: 'FAQ',
    icon: '?',
    titleField: 'q',
    fields: [
      { name: 'q', label: 'Question', type: 'text', required: true },
      { name: 'a', label: 'Answer', type: 'textarea', required: true },
    ],
  },
  {
    key: 'partners',
    label: 'Partners',
    icon: '∞',
    titleField: 'name',
    fields: [{ name: 'name', label: 'Partner name', type: 'text', required: true }],
  },
  {
    key: 'tiers',
    label: 'Donation tiers',
    icon: '৳',
    titleField: 'amount',
    fields: [
      { name: 'amount', label: 'Amount (display)', type: 'text', required: true },
      { name: 'unit', label: 'Unit (birr)', type: 'text' },
      { name: 'ref', label: 'Transfer ref (GENERAL/GAMO/MEMBER)', type: 'text' },
      { name: 'note', label: 'Note under tiers', type: 'text' },
      { name: 'hot', label: 'Highlighted ("most common")', type: 'toggle' },
    ],
  },
  {
    key: 'updates',
    label: 'Field updates',
    icon: '✎',
    titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date (e.g. July 2026)', type: 'text' },
      { name: 'body', label: 'Body', type: 'textarea' },
      { name: 'img', label: 'Photo', type: 'image' },
    ],
  },
]
