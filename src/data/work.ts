import maharashtraPreview from '@/assets/previews/maharashtra.jpg';
import uaePreview from '@/assets/previews/uae.jpg';
import pujariPreview from '@/assets/previews/pujari.jpg';
import scadaPreview from '@/assets/previews/scada.jpg';
import chatbotPreview from '@/assets/previews/chatbot.jpg';
import shopPreview from '@/assets/previews/shop.jpg';
import cafePreview from '@/assets/previews/cafe.jpg';

export const highlights = [
  { value: '60,000+', label: 'bales managed by the warehouse system I modernised at Reliance' },
  { value: '40+', label: 'audit-ready reports delivered for a pharma production line at Cipla' },
  { value: '15+', label: 'websites and web applications shipped to production' },
  { value: '4', label: 'interactive demos you can try on this site' },
];

/** Flagship engagements, newest first. */
export interface CaseStudy {
  id: string;
  title: string;
  period?: string;
  context: string;
  summary: string;
  points: string[];
  stack: string[];
  image?: string;
  /** Hosted demo on this site. */
  demo?: { label: string; href: string; external?: boolean };
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'web-scada',
    title: '3D Web SCADA for plant monitoring',
    context: 'Industrial automation',
    summary:
      'SCADA screens are usually locked to a single control-room PC. I engineered a SCADA that runs in any browser, with a Python backend that talks directly to the PLCs.',
    points: [
      'Live 2D and 3D mimics of a plating line and a dairy plant in Three.js, with wagon tracking, tank status and auto / manual / service modes.',
      'FastAPI backend polling Siemens S7 and Mitsubishi PLCs and streaming tag values to the UI over WebSockets.',
      'Alarm handling plus twelve production reports with CSV and PDF export.',
      'Configuration for stations, tanks, recipes, temperatures and spray pumps, Excel tag import, and a builder that packages a site as a Windows EXE.',
    ],
    stack: ['React', 'Three.js', 'React Three Fiber', 'Python', 'FastAPI', 'WebSockets', 'Siemens S7', 'Mitsubishi MC', 'Excel import'],
    image: scadaPreview,
    demo: { label: 'Open live demo', href: '/scada-demo/', external: true },
  },
  {
    id: 'amc-support',
    title: 'AMC support platform with a WhatsApp chatbot',
    period: 'Nov 2025',
    context: 'Support automation',
    summary:
      'Clients on annual maintenance contracts reported faults through calls and scattered messages. I built a platform where they raise a ticket by chatting on WhatsApp and the right engineer is notified instantly.',
    points: [
      'WhatsApp bot on Node.js and webhooks that turns a client conversation into a tracked support ticket.',
      'Python notification service that pushes automatic WhatsApp updates to engineers and clients.',
      'React + Node.js + MySQL dashboard to manage clients, engineers, contracts and open tickets.',
      'Role-based authentication so admins, engineers and clients each see only what they need.',
    ],
    stack: ['React', 'Node.js', 'MySQL', 'Python', 'Webhooks', 'WhatsApp Business API'],
  },
  {
    id: 'reliance',
    title: 'Automatic Bale Handling System — Reliance Industries',
    period: 'Nov 2023 – Jul 2024',
    context: 'Reliance PSF Warehouse, Hazira (on-site & remote)',
    summary:
      'The bale warehouse ran on a DOS-based system built by Autefa (Germany) in 1994. I led its migration to a modern Oracle platform that manages 60,000+ bales across manual and automated operations.',
    points: [
      'Migrated data and logic from the legacy Ingres / DOS stack to Oracle Database without disrupting warehouse operations.',
      'Designed the new operator interface in Oracle APEX, replacing DOS screens with a web GUI.',
      'Integrated the C-based warehouse server program and coordinated multiple server setups across production segments.',
      'Wrote Linux shell scripts for backups and system reliability.',
      'Result: faster response times, more accurate inventory and finer control over production lines.',
    ],
    stack: ['Oracle Database', 'Oracle APEX', 'PL/SQL', 'Linux shell scripting', 'C', 'JavaScript', 'Ingres (legacy)'],
  },
  {
    id: 'cipla',
    title: 'Compliance reporting application — Cipla',
    period: 'Aug – Sep 2023',
    context: 'Cipla Ltd., Goa (on-site)',
    summary:
      'Cipla commissioned a new 15K + 10K + 12K pressure-tank system for sensitive drug production. I built the application that logs and audits every critical stage, from raw-material input to finished product.',
    points: [
      'Delivered 40+ analytical and audit reports for process validation, equipment performance and quality assurance.',
      'Pulled live process data from the Siemens WinCC server through a SQL Server linked server.',
      'Reports follow 21 CFR Part 11 practice, keeping records traceable and audit-ready.',
      'MVVM architecture in .NET keeps the reporting layer easy to extend and maintain.',
    ],
    stack: ['C# / .NET', 'MVVM', 'SQL Server', 'Siemens WinCC', 'Linked servers'],
  },
];

/** Interactive demos hosted on this site (the SCADA demo is linked from its case study). */
export interface Demo {
  id: string;
  title: string;
  path: string;
  /** True for a separate app (opened in a new tab) rather than a page of this site. */
  external?: boolean;
  category: string;
  summary: string;
  highlights: string[];
  image: string;
}

export const demos: Demo[] = [
  {
    id: 'chat-bot',
    title: 'WhatsApp & Website Chat Bots',
    path: '/chat-bot',
    category: 'Customer Engagement',
    summary:
      'A WhatsApp assistant that books clinic appointments, and a website widget that qualifies real-estate leads through a guided conversation.',
    highlights: ['WhatsApp Bot', 'Website Widget', 'Guided Flows'],
    image: chatbotPreview,
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    path: '/ecommerce-demo',
    category: 'Online Retail',
    summary: 'A single-page store with search, category filters, wishlist, cart, coupon codes and a complete checkout flow.',
    highlights: ['Product Catalogue', 'Cart & Checkout', 'Responsive'],
    image: shopPreview,
  },
  {
    id: 'mobile-app',
    title: 'Café Order Management App',
    path: '/mobile-app-demo',
    category: 'Mobile Application',
    summary: 'A staff app to take table orders, move them through the kitchen and track the day’s sales on a dashboard.',
    highlights: ['Order Workflow', 'Kitchen Tracking', 'Sales Dashboard'],
    image: cafePreview,
  },
];

/** Client websites and platforms. */
export interface Website {
  id: string;
  title: string;
  url?: string;
  category: string;
  summary: string;
  highlights: string[];
  image?: string;
}

export const websites: Website[] = [
  {
    id: 'maharashtra',
    title: 'Maharashtra Government News Portal',
    url: 'https://amrutmaharashtra.org/',
    category: 'Government Portal',
    summary:
      'A public news and information portal with editorial publishing workflows, deployed in the cloud to stay available through traffic spikes.',
    highlights: ['Content Management', 'High Availability', 'Cloud Deployment'],
    image: maharashtraPreview,
  },
  {
    id: 'uae',
    title: 'UAE Corporate Website',
    url: 'https://ms-website-uae.vercel.app/',
    category: 'International Client',
    summary: 'A fast, premium corporate presence for a UAE-based client, designed to look sharp on every device.',
    highlights: ['Modern UI', 'Responsive Design', 'Performance'],
    image: uaePreview,
  },
  {
    id: 'pujari',
    title: 'Pujari Online Platform',
    url: 'https://pujari.mydashboard.site/',
    category: 'Community Platform',
    summary:
      'A custom portal connecting service providers with their communities, with role-based user management and cloud hosting.',
    highlights: ['Custom Portal', 'User Management', 'Cloud Hosting'],
    image: pujariPreview,
  },
  {
    id: 'siddhai',
    title: 'Siddhai Food',
    category: 'E-commerce',
    summary: 'A complete e-commerce platform for food products, with payment gateway integration and order management.',
    highlights: ['Payments', 'Order Management'],
  },
  {
    id: 'kokan',
    title: 'Kokan Delicious',
    category: 'Product Showcase',
    summary: 'A website for a Konkan cashew brand, with a product showcase and enquiry flow.',
    highlights: ['Product Showcase', 'Enquiries'],
  },
  {
    id: 'rosary',
    title: 'Rosary IoT',
    category: 'IoT Platform',
    summary: 'Remote monitoring and control for industrial machines, with real-time data over MQTT.',
    highlights: ['MQTT', 'Remote Control', 'Real-time Data'],
  },
];

export const creative = [
  {
    title: 'Planet B12',
    kind: '3D Animation',
    text: 'A low-poly 3D short featuring After Effects and VFX work.',
    href: 'https://youtu.be/QD6aW_hyaWE',
    cta: 'Watch on YouTube',
  },
  {
    title: 'Ratnagiri City Promenade',
    kind: '3D Animation',
    text: 'A 3D walkthrough of the Mandavi beachside promenade in my hometown.',
    href: 'https://youtu.be/onyaZCFaMRE',
    cta: 'Watch on YouTube',
  },
  {
    title: 'Original Compositions',
    kind: 'Music',
    text: 'I compose and arrange original music for local clients.',
    href: 'https://www.youtube.com/@sanketsth14',
    cta: 'Visit my channel',
  },
];

export const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');
