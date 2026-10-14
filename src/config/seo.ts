// Per-route SEO metadata. Used at runtime by <Seo /> and at build time by the
// static-HTML generator in vite.config.ts so crawlers get correct tags without JS.

export const defaultTitle = 'Sanket Sathe | Senior Software Developer · Full Stack, Cloud & Industrial Software';

export const defaultDescription =
  'Sanket Sathe is a Senior Software Developer who builds web platforms, cloud deployments, SCADA and compliance reporting systems, WhatsApp automation and mobile apps — from database to deployment.';

export const keywords = [
  'Sanket Sathe', 'Senior Software Developer', 'Full Stack Developer', 'React Developer', 'Node.js Developer', 'FastAPI', 'Python', 'PHP', '.NET',
  'DevOps', 'Docker', 'Kubernetes', 'AWS', 'Oracle APEX', 'Oracle', 'MySQL', 'PostgreSQL', 'MongoDB', 'SQL Server',
  'SCADA', 'Industrial Automation', 'IoT', 'MQTT', 'WhatsApp Chatbot', 'Grafana', 'Ratnagiri', 'Maharashtra',
].join(', ');

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  priority: number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
}

export const routeMeta: RouteMeta[] = [
  { path: '/', title: defaultTitle, description: defaultDescription, priority: 1.0, changefreq: 'monthly' },
  {
    path: '/chat-bot',
    title: 'Chat Bot Demo | WhatsApp & Website Chat Bots | Sanket Sathe',
    description:
      'Try two live chat bot demos built by Sanket Sathe: a WhatsApp bot that books clinic appointments and a website chat widget that qualifies real-estate leads.',
    priority: 0.7, changefreq: 'monthly',
  },
  {
    path: '/ecommerce-demo',
    title: 'E-commerce Website Demo | Online Store | Sanket Sathe',
    description:
      'A single-page e-commerce store demo with search, filters, wishlist, cart, coupon codes and checkout, built in React on mock data.',
    priority: 0.6, changefreq: 'monthly',
  },
  {
    path: '/mobile-app-demo',
    title: 'Mobile App Demo | Café Order Management App | Sanket Sathe',
    description:
      'A café order-management mobile app demo: take table orders, track them through the kitchen and see the day’s sales dashboard.',
    priority: 0.6, changefreq: 'monthly',
  },
];

export const getRouteMeta = (path: string): RouteMeta | undefined =>
  routeMeta.find((r) => r.path === path);
