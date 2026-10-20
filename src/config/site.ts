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
  title: 'Md Jaber: Founder, builder and automation designer',
  description:
    'Portfolio of Md Jaber, founder of FloowTix: websites, CRM products and n8n automations for businesses, built with AI-assisted workflows.',
  // TODO(verify): location wording.
  location: 'Bangladesh',
  role: 'Founder · Web & Automation Builder',
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
    { label: 'LinkedIn', url: '' },
    { label: 'GitHub', url: '' },
    { label: 'Facebook', url: '' },
    { label: 'WhatsApp', url: '' },
  ],
} as const;

/** Hero headline, split into lines for the reveal animation. */
export const heroLines = ['I build systems', 'that make businesses', '*run on their own.*'];

export const heroIntro =
  'Founder of FloowTix. I design and build websites, CRM products and n8n automations, using AI as a deliberate part of how I research, write, design and code.';

/** Short capability words for the marquee. */
export const marquee = [
  'Business websites',
  'CRM products',
  'n8n automation',
  'AI-assisted development',
  'Landing pages',
  'Workflow design',
];

/**
 * What Jaber actually does. Keep these honest: describe the work, not invented outcomes.
 */
export const capabilities = [
  {
    index: '01',
    title: 'Websites that sell the business',
    body: 'Responsive marketing sites for local businesses such as clinics, trades and gyms. Clear structure, fast pages and a direct path to contact.',
    tags: ['Responsive UI', 'Landing pages', 'SEO basics'],
  },
  {
    index: '02',
    title: 'CRM & business products',
    body: 'Product thinking for tools like FloowTix CRM and BebshaFlow: mapping real workflows into screens, data and features that a team will use.',
    tags: ['Product design', 'Dashboards', 'Data flows'],
  },
  {
    index: '03',
    title: 'n8n automation',
    body: 'Workflows that connect forms, messaging, sheets and CRMs so repetitive follow-ups and hand-offs happen without manual copy-paste.',
    tags: ['n8n', 'Integrations', 'Webhooks'],
  },
  {
    index: '04',
    title: 'AI-assisted building',
    body: 'I work with AI tools openly to plan, draft, design and code. I direct, review and test what ships, so the speed helps without lowering the quality.',
    tags: ['Prompting', 'Rapid prototyping', 'Review & QA'],
  },
];

/** How a project runs. */
export const process = [
  { step: 'Understand', body: 'Learn how the business works today: customers, bottlenecks and what “done” looks like.' },
  { step: 'Design', body: 'Shape the structure, flows and visuals before writing a lot of code.' },
  { step: 'Build', body: 'Ship in small, reviewable steps with AI-assisted speed and human judgement.' },
  { step: 'Automate', body: 'Remove the repetitive parts with n8n so the system keeps working after launch.' },
];

/** Founder story paragraphs (About section). TODO(verify): edit freely in your own voice. */
export const about = [
  'I’m Md Jaber, the founder of FloowTix. My work sits where business operations meet software: the websites people find you through, the CRM your team works in, and the automations that link them.',
  'I build with AI on purpose. It speeds up research, drafting, design and code, and I stay responsible for every decision, review and test before anything goes live.',
];
