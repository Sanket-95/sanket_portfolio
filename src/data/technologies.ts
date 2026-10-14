import type { BrandKey } from './brandIcons';

export interface Technology {
  name: string;
  icon: BrandKey;
}

export interface TechCategory {
  id: string;
  title: string;
  description: string;
  items: Technology[];
}

export const techCategories: TechCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'Responsive interfaces, dashboards and 3D views.',
    items: [
      { name: 'React', icon: 'react' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'Three.js', icon: 'threejs' },
      { name: 'Tailwind CSS', icon: 'tailwindcss' },
      { name: 'Bootstrap', icon: 'bootstrap' },
      { name: 'jQuery', icon: 'jquery' },
      { name: 'HTML5', icon: 'html5' },
      { name: 'CSS3', icon: 'css' },
      { name: 'Vite', icon: 'vite' },
      { name: 'Framer Motion', icon: 'framer' },
      { name: 'React Native', icon: 'react' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    description: 'APIs, services, integrations and real-time data.',
    items: [
      { name: 'Node.js', icon: 'nodejs' },
      { name: 'Python', icon: 'python' },
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'PHP', icon: 'php' },
      { name: '.NET / C#', icon: 'dotnet' },
      { name: 'C', icon: 'c' },
      { name: 'PL/SQL', icon: 'oracle' },
      { name: 'WebSockets', icon: 'websocket' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Schema design, tuning and legacy migrations.',
    items: [
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Oracle', icon: 'oracle' },
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'MongoDB', icon: 'mongodb' },
      { name: 'SQL Server', icon: 'sqlserver' },
      { name: 'Ingres (legacy)', icon: 'database' },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & Hosting',
    description: 'Containerised deployments and the servers behind them.',
    items: [
      { name: 'Docker', icon: 'docker' },
      { name: 'Kubernetes', icon: 'kubernetes' },
      { name: 'Linux', icon: 'linux' },
      { name: 'AWS', icon: 'aws' },
      { name: 'DigitalOcean', icon: 'digitalocean' },
      { name: 'Vercel', icon: 'vercel' },
      { name: 'Hostinger', icon: 'hostinger' },
      { name: 'HostGator', icon: 'hostgator' },
      { name: 'BigRock', icon: 'bigrock' },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Tools',
    description: 'Version control, automation, delivery and monitoring.',
    items: [
      { name: 'Git', icon: 'git' },
      { name: 'GitHub', icon: 'github' },
      { name: 'GitLab', icon: 'gitlab' },
      { name: 'CI/CD', icon: 'githubactions' },
      { name: 'Shell / Cron', icon: 'bash' },
      { name: 'Health Monitoring', icon: 'gauge' },
      { name: 'Jira', icon: 'jira' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Low-code',
    description: 'Dashboards, reporting and fast business tools.',
    items: [
      { name: 'Grafana', icon: 'grafana' },
      { name: 'Oracle APEX', icon: 'apex' },
      { name: 'Odoo', icon: 'odoo' },
      { name: 'Kizen', icon: 'lowcode' },
    ],
  },
  {
    id: 'industrial',
    title: 'Industrial & IoT',
    description: 'Connecting the plant floor to software.',
    items: [
      { name: 'SCADA', icon: 'gauge' },
      { name: 'Siemens WinCC', icon: 'siemens' },
      { name: 'Siemens S7 PLC', icon: 'siemens' },
      { name: 'Mitsubishi PLC', icon: 'mitsubishi' },
      { name: 'MQTT', icon: 'mqtt' },
    ],
  },
  {
    id: 'automation',
    title: 'Automation & AI',
    description: 'Bots, notifications and AI-assisted workflows.',
    items: [
      { name: 'WhatsApp API', icon: 'whatsapp' },
      { name: 'Chatbots', icon: 'chat' },
      { name: 'Claude AI', icon: 'claude' },
      { name: 'Email Automation', icon: 'mail' },
    ],
  },
];

/** Logos shown floating in the hero. */
export const heroTechnologies: Technology[] = [
  { name: 'React', icon: 'react' },
  { name: 'Node.js', icon: 'nodejs' },
  { name: 'Docker', icon: 'docker' },
  { name: 'Kubernetes', icon: 'kubernetes' },
  { name: 'Oracle', icon: 'oracle' },
  { name: 'FastAPI', icon: 'fastapi' },
  { name: 'MongoDB', icon: 'mongodb' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'Grafana', icon: 'grafana' },
];
