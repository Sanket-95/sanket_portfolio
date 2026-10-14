// Site-wide constants. This file is shared by the app and vite.config.ts,
// so it must stay free of browser- or Vite-specific APIs.

/** Production URL, used for canonical links, sitemap and Open Graph. Override with VITE_SITE_URL in .env. */
export const DEFAULT_SITE_URL = 'https://sanket-95.github.io';

export const profile = {
  name: 'Sanket Sathe',
  role: 'Senior Software Developer',
  tagline: 'Senior Software Developer · Full Stack · Cloud & DevOps · Industrial Software',
  email: 'sanketsth95@gmail.com',
  altEmail: 'sanketsth14@gmail.com',
  phone: '+91 99233 86890',
  phoneHref: 'tel:+919923386890',
  location: 'Ratnagiri, Maharashtra, India 415612',
  city: 'Ratnagiri, Maharashtra',
  workMode: 'Open to remote and hybrid roles',
  social: {
    github: 'https://github.com/Sanket-95',
    linkedin: 'https://www.linkedin.com/in/sathesanket',
    youtube: 'https://www.youtube.com/@sanketsth14',
    instagram: 'https://www.instagram.com/sathesanket/',
  },
} as const;

export interface NavItem {
  label: string;
  to: string;
}

export const navItems: NavItem[] = [
  { label: 'Work', to: '/#work' },
  { label: 'Demos', to: '/#demos' },
  { label: 'Websites', to: '/#websites' },
  { label: 'Tech Stack', to: '/#technologies' },
  { label: 'About', to: '/#about' },
];
