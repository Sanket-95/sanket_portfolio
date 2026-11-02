// Portfolio Planet — game content. Edit this file to change the monuments, the ship
// parts and the wording; nothing else in the game needs to change.
//
// Positions are latitude / longitude on the planet in degrees:
//   lat: -90 (south pole) … 90 (north pole)   lon: -180 … 180
// The player starts next to the ship, so keep monuments at least ~25° away from it.

import type { BrandKey } from '@/data/brandIcons';
import scadaPreview from '@/assets/previews/scada.jpg';
import maharashtraPreview from '@/assets/previews/maharashtra.jpg';
import chatbotPreview from '@/assets/previews/chatbot.jpg';

export type MonumentShape = 'tower' | 'crystal' | 'pillar' | 'arch' | 'dome';
export type PartKind = 'nose' | 'wing-left' | 'wing-right' | 'dish' | 'thruster';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface Monument {
  id: string;
  title: string;
  description: string;
  tech: string[];
  /** Live site. A path starting with "/" opens a page of this website. */
  link?: string;
  github?: string;
  /** Accent colour of the monument and its ship part. */
  color: string;
  shape: MonumentShape;
  position: LatLon;
  /** Real screenshot shown on a billboard next to the monument. */
  image?: string;
  /** 3D tech logo floating above the monument (key from src/data/brandIcons.ts). */
  icon?: BrandKey;
}

export interface ShipPart {
  id: string;
  name: string;
  kind: PartKind;
  /** The monument this part lies next to. */
  monument: string;
}

export const monuments: Monument[] = [
  {
    id: 'reliance',
    title: 'Automatic Bale Handling System — Reliance Industries',
    description:
      'Migrated a 1994 DOS-based warehouse system to Oracle, managing 60,000+ bales across manual and automated operations at the Reliance PSF warehouse, Hazira.',
    tech: ['Oracle Database', 'Oracle APEX', 'PL/SQL', 'Linux', 'C'],
    link: '/#work',
    color: '#f59e0b',
    shape: 'tower',
    position: { lat: 38, lon: 72 },
    icon: 'oracle',
  },
  {
    id: 'cipla',
    title: 'Compliance Reporting Application — Cipla',
    description:
      'Logs and audits every critical stage of a new pressure-tank system for drug production, with 40+ audit-ready reports from Siemens WinCC data.',
    tech: ['C# / .NET', 'MVVM', 'SQL Server', 'Siemens WinCC'],
    link: '/#work',
    color: '#38bdf8',
    shape: 'crystal',
    position: { lat: -28, lon: 118 },
    icon: 'dotnet',
  },
  {
    id: 'maharashtra',
    title: 'Maharashtra Government News Portal',
    description:
      'A public news and information portal with editorial publishing workflows, deployed in the cloud to stay available through traffic spikes.',
    tech: ['Content Management', 'High Availability', 'Cloud Deployment'],
    link: 'https://amrutmaharashtra.org/',
    color: '#f472b6',
    shape: 'dome',
    position: { lat: 12, lon: -168 },
    image: maharashtraPreview,
    icon: 'react',
  },
  {
    id: 'web-scada',
    title: '3D Web SCADA',
    description:
      'A SCADA that runs in any browser: live 2D and 3D plant mimics, a FastAPI backend talking to Siemens and Mitsubishi PLCs, alarms and reports.',
    tech: ['React', 'Three.js', 'FastAPI', 'WebSockets', 'Siemens S7'],
    link: '/scada-demo/',
    color: '#34d399',
    shape: 'pillar',
    position: { lat: -40, lon: -95 },
    image: scadaPreview,
    icon: 'fastapi',
  },
  {
    id: 'amc-support',
    title: 'AMC Support Platform with a WhatsApp Chatbot',
    description:
      'Clients raise a support ticket by chatting on WhatsApp and the right engineer is notified instantly. React, Node.js and MySQL dashboard.',
    tech: ['Node.js', 'WhatsApp Business API', 'Python', 'MySQL'],
    link: '/chat-bot',
    color: '#a78bfa',
    shape: 'arch',
    position: { lat: 50, lon: -40 },
    image: chatbotPreview,
    icon: 'whatsapp',
  },
];

export const shipParts: ShipPart[] = [
  { id: 'nose', name: 'Nose cone', kind: 'nose', monument: 'reliance' },
  { id: 'wing-left', name: 'Left wing', kind: 'wing-left', monument: 'cipla' },
  { id: 'dish', name: 'Navigation dish', kind: 'dish', monument: 'maharashtra' },
  { id: 'thruster', name: 'Thruster', kind: 'thruster', monument: 'web-scada' },
  { id: 'wing-right', name: 'Right wing', kind: 'wing-right', monument: 'amc-support' },
];

/** Where the ship crash-landed. The player starts right next to it. */
export const shipSite: LatLon = { lat: 4, lon: 0 };

/** Texts shown in the game. */
export const copy = {
  title: 'Portfolio Planet',
  story: [
    'Your spaceship crash-landed on a tiny planet and its 5 parts are scattered around it.',
    'Each part lies next to a monument to one of my projects. Find them all and fly home.',
  ],
  viewProjects: 'View my projects',
  contact: 'Contact me',
};
