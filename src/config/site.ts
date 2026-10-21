/**
 * Single source of truth for personal copy and links.
 *
 * Everything here should be TRUE and verifiable. Anything marked
 * `TODO(verify)` is a sensible default that Jaber should confirm or edit.
 * Empty strings hide the related UI (e.g. an empty social URL is not rendered).
 */

export const site = {
  name: 'Md Jaber',
  shortName: 'Jaber',
  title: 'Md Jaber: Founder & AI-assisted product creator',
  description:
    'Portfolio of Md Jaber, founder of FloowTix. Websites, CRM setups and n8n automations created with AI tools such as Claude Code and Codex, plus no-code and CRM platforms.',
  // TODO(verify): location wording.
  location: 'Bangladesh',
  role: 'Founder · AI-assisted product creator',
  // TODO(verify): this is the email on your account. Change it if you want a different public contact address.
  email: 'mdjaber.officials@gmail.com',
  // Shown in the nav + hero. Set to false to hide the badge.
  availableForWork: true,
  availabilityText: 'Open to new projects',

  founder: {
    company: 'FloowTix',
    // TODO(verify): add the live FloowTix URL to link it (left empty = no link).
    url: '',
  },

  // Leave a URL empty to hide that link.
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jaber-flowtix/' },
    { label: 'GitHub', url: '' },
    { label: 'Facebook', url: '' },
    { label: 'WhatsApp', url: '' },
  ],
} as const;

/** Hero headline, split into lines for the reveal animation. `*text*` = serif accent. */
export const heroLines = ['I turn ideas into', 'working digital', '*products.*'];

export const heroIntro =
  'Founder of FloowTix. I create websites, CRM setups and n8n automations by directing AI tools like Claude Code and Codex, alongside no-code and CRM platforms.';

/** Short capability words for the marquee. */
export const marquee = [
  'Business websites',
  'CRM setups',
  'n8n automation',
  'Claude Code',
  'Codex',
  'No-code tools',
  'Product planning',
];

/**
 * What Jaber actually does. Keep these honest: describe the work and the method,
 * never invented outcomes or a higher level of coding expertise than is true.
 */
export const capabilities = [
  {
    index: '01',
    title: 'Business websites',
    body: 'Marketing sites for local businesses such as clinics, trades and gyms, focused on clear structure, mobile-friendly layouts and an easy way to get in touch.',
    tags: ['Landing pages', 'Responsive layouts', 'Contact flows'],
  },
  {
    index: '02',
    title: 'CRM & product concepts',
    body: 'Shaping products like FloowTix CRM and BebshaFlow: mapping how a business works into screens, data and features, then creating them with AI coding tools.',
    tags: ['Product planning', 'Dashboards', 'CRM platforms'],
  },
  {
    index: '03',
    title: 'n8n automation',
    body: 'Workflows that connect forms, messaging, sheets and CRMs to cut down repetitive copy-paste and follow-up steps.',
    tags: ['n8n', 'Integrations', 'Webhooks'],
  },
  {
    index: '04',
    title: 'AI-assisted building',
    body: 'I’m not a traditional programmer. I plan, prompt and review while Claude Code and Codex write much of the code, then I test the result myself before sharing it.',
    tags: ['Claude Code', 'Codex', 'No-code tools'],
  },
];

/** How a project runs. */
export const process = [
  { step: 'Understand', body: 'Learn how the business works today: its customers, its bottlenecks and what a useful result looks like.' },
  { step: 'Plan', body: 'Map pages, flows and data before anything is built, so the AI tools get clear direction.' },
  { step: 'Create', body: 'Build in small steps with Claude Code, Codex and no-code tools, reviewing each step as it lands.' },
  { step: 'Connect', body: 'Use n8n and CRM platforms to link the tools the business already relies on.' },
];

/** Founder story paragraphs (About section). TODO(verify): edit freely in your own voice. */
export const about = [
  'I’m Md Jaber, founder of FloowTix. I work where business operations meet software: the website customers find, the CRM a team works in, and the automations that connect them.',
  'I’m not a traditional programmer, and I don’t present myself as one. I use AI tools like Claude Code and Codex, plus no-code and CRM platforms, to turn plans into working products, and I test what they produce before I share it.',
];

/** Quick facts under the About copy. */
export const facts = [
  { label: 'Company', value: 'FloowTix', link: 'founder' },
  { label: 'Focus', value: 'Websites · CRM · Automation' },
  { label: 'Tools', value: 'Claude Code · Codex · n8n' },
  { label: 'Based in', value: site.location },
] as const;
