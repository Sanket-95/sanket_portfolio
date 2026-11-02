// Island Escape — every editable piece of the island lives in this file.
//
// Coordinates are world units on the ground plane: x grows to the east, z grows to the
// south (the mini-map shows north up). The island centre is (0, 0). The shoreline sits
// roughly `WORLD.islandRadius` from the centre (it wobbles a little); keep sites and
// symbols inside ~0.8 × that radius unless they are meant to be on the beach.
//
// Project TEXT is not written here: each site points at an entry in src/data/work.ts
// (`source`), so the game always shows the same wording as the website.

import type { BrandKey } from '@/data/brandIcons';
import scadaPreview from '@/assets/previews/scada.jpg';
import chatbotPreview from '@/assets/previews/chatbot.jpg';
import maharashtraPreview from '@/assets/previews/maharashtra.jpg';
import uaePreview from '@/assets/previews/uae.jpg';
import pujariPreview from '@/assets/previews/pujari.jpg';
import shopPreview from '@/assets/previews/shop.jpg';
import cafePreview from '@/assets/previews/cafe.jpg';

export const WORLD = {
  /** Side of one terrain chunk. */
  chunkSize: 20,
  /** Chunks mounted around the player's chunk in each direction (2 → a 5 × 5 block). */
  viewRings: 2,
  /** Average distance from the centre to the shoreline. */
  islandRadius: 66,
  /** Changes the coastline wobble, the ground noise and where palms and rocks grow. */
  seed: 7,
  /** Project sites closer than this show their full model and screenshot. */
  siteDetailDistance: 26,
  /** Tech symbols closer than this become extruded 3D logos (glowing sprites further away). */
  symbolDetailDistance: 18,
  /** How many palms, rocks and bushes to scatter over the island. */
  palms: 150,
  rocks: 80,
  bushes: 120,
};

/** Smooth, walkable hills. */
export interface Hill {
  x: number;
  z: number;
  radius: number;
  height: number;
}

export const hills: Hill[] = [
  { x: -14, z: -6, radius: 14, height: 3.2 }, // temple hill
  { x: -22, z: -36, radius: 11, height: 4.2 }, // the island's peak
  { x: 6, z: -26, radius: 10, height: 2.6 },
  { x: -42, z: -12, radius: 9, height: 2.4 },
  { x: 36, z: 6, radius: 8, height: 1.6 },
  { x: -4, z: 8, radius: 8, height: 1.6 },
  { x: 30, z: 42, radius: 7, height: 1.2 },
];

/** A stretch of high rocky coast instead of beach. `angle` in radians (0 = east, −π/2 = north). */
export const cliff = { angle: -0.72, width: 0.5, height: 3.4 };

/** Where the wrecked boat lies: direction from the centre, in radians (π/2 = due south). */
export const boat = { angle: Math.PI / 2 + 0.12 };

export interface SymbolSpot {
  key: BrandKey;
  x: number;
  z: number;
  /** Sits on top of a large rock: the player has to jump to reach it. */
  rock?: boolean;
}

/** The tech symbols to collect (the material for the boat), in the order they fill it. */
export const symbols: SymbolSpot[] = [
  { key: 'react', x: 3, z: 44 },
  { key: 'typescript', x: -18, z: 46 },
  { key: 'nodejs', x: -30, z: 18 },
  { key: 'mysql', x: -46, z: 24, rock: true },
  { key: 'python', x: -54, z: -2 },
  { key: 'php', x: -38, z: 40 },
  { key: 'oracle', x: -36, z: -28 },
  { key: 'linux', x: -22, z: -36 },
  { key: 'docker', x: -6, z: -54 },
  { key: 'fastapi', x: 6, z: -26 },
  { key: 'kubernetes', x: 16, z: -32, rock: true },
  { key: 'threejs', x: -2, z: -14 },
  { key: 'siemens', x: 42, z: -36 },
  { key: 'sqlserver', x: 24, z: -38, rock: true },
  { key: 'dotnet', x: 56, z: -10 },
  { key: 'mqtt', x: 24, z: -2 },
  { key: 'mongodb', x: 36, z: 14 },
  { key: 'postgresql', x: 52, z: 20 },
  { key: 'grafana', x: 8, z: 18, rock: true },
  { key: 'aws', x: 44, z: 40 },
];

export type Landmark =
  | 'warehouse'
  | 'pharma'
  | 'tower'
  | 'support-hut'
  | 'press'
  | 'office'
  | 'temple'
  | 'iot'
  | 'food-stall'
  | 'cashew-stall'
  | 'shop'
  | 'cafe';

/** Which entry of src/data/work.ts a site shows. */
export type SiteSource = { list: 'caseStudies' | 'websites' | 'demos'; id: string };

export interface Site {
  id: string;
  source: SiteSource;
  landmark: Landmark;
  x: number;
  z: number;
  /** Accent colour of the site's ring, flag and card. */
  color: string;
  /** Tech logos floating around the landmark (decoration, not collectible). */
  logos: BrandKey[];
  /** Real screenshot shown on a billboard next to the landmark. */
  image?: string;
  /** The card's button. A path starting with "/" is a page of this site. */
  link?: { href: string; label: string; newTab?: boolean };
}

export const sites: Site[] = [
  {
    id: 'reliance',
    source: { list: 'caseStudies', id: 'reliance' },
    landmark: 'warehouse',
    x: -30,
    z: -18,
    color: '#f59e0b',
    logos: ['oracle', 'apex', 'linux', 'c'],
    link: { href: '/#work', label: 'Read the case study' },
  },
  {
    id: 'cipla',
    source: { list: 'caseStudies', id: 'cipla' },
    landmark: 'pharma',
    x: 30,
    z: -20,
    color: '#38bdf8',
    logos: ['dotnet', 'sqlserver', 'siemens'],
    link: { href: '/#work', label: 'Read the case study' },
  },
  {
    id: 'web-scada',
    source: { list: 'caseStudies', id: 'web-scada' },
    landmark: 'tower',
    x: -4,
    z: -40,
    color: '#34d399',
    logos: ['react', 'threejs', 'fastapi', 'websocket', 'siemens', 'mitsubishi'],
    image: scadaPreview,
    link: { href: '/scada-demo/', label: 'Open the live demo', newTab: true },
  },
  {
    id: 'amc-support',
    source: { list: 'caseStudies', id: 'amc-support' },
    landmark: 'support-hut',
    x: -40,
    z: 8,
    color: '#25d366',
    logos: ['whatsapp', 'nodejs', 'mysql', 'python'],
    image: chatbotPreview,
    link: { href: '/chat-bot', label: 'Try the chat bot demo' },
  },
  {
    id: 'maharashtra',
    source: { list: 'websites', id: 'maharashtra' },
    landmark: 'press',
    x: 20,
    z: 12,
    color: '#f472b6',
    logos: [],
    image: maharashtraPreview,
    link: { href: 'https://amrutmaharashtra.org/', label: 'Visit the site', newTab: true },
  },
  {
    id: 'uae',
    source: { list: 'websites', id: 'uae' },
    landmark: 'office',
    x: 44,
    z: -2,
    color: '#22d3ee',
    logos: [],
    image: uaePreview,
    link: { href: 'https://ms-website-uae.vercel.app/', label: 'Visit the site', newTab: true },
  },
  {
    id: 'pujari',
    source: { list: 'websites', id: 'pujari' },
    landmark: 'temple',
    x: -14,
    z: -6,
    color: '#fb923c',
    logos: [],
    image: pujariPreview,
    link: { href: 'https://pujari.mydashboard.site/', label: 'Visit the site', newTab: true },
  },
  {
    id: 'rosary',
    source: { list: 'websites', id: 'rosary' },
    landmark: 'iot',
    x: 12,
    z: -10,
    color: '#c561c5',
    logos: ['mqtt'],
  },
  {
    id: 'siddhai',
    source: { list: 'websites', id: 'siddhai' },
    landmark: 'food-stall',
    x: -26,
    z: 30,
    color: '#ef4444',
    logos: [],
  },
  {
    id: 'kokan',
    source: { list: 'websites', id: 'kokan' },
    landmark: 'cashew-stall',
    x: -8,
    z: 26,
    color: '#d97706',
    logos: [],
  },
  {
    id: 'ecommerce',
    source: { list: 'demos', id: 'ecommerce' },
    landmark: 'shop',
    x: 16,
    z: 34,
    color: '#3b82f6',
    logos: [],
    image: shopPreview,
    link: { href: '/ecommerce-demo', label: 'Open the live demo' },
  },
  {
    id: 'cafe',
    source: { list: 'demos', id: 'mobile-app' },
    landmark: 'cafe',
    x: 32,
    z: 26,
    color: '#a16207',
    logos: [],
    image: cafePreview,
    link: { href: '/mobile-app-demo', label: 'Open the live demo' },
  },
];

/** Dirt paths, each a chain of site ids ("start" is the beach next to the boat). */
export const paths: string[][] = [
  ['start', 'kokan', 'pujari', 'reliance', 'web-scada'],
  ['start', 'ecommerce', 'cafe', 'maharashtra', 'uae'],
  ['kokan', 'siddhai', 'amc-support', 'reliance'],
  ['pujari', 'rosary', 'cipla', 'uae'],
  ['rosary', 'maharashtra'],
  ['web-scada', 'cipla'],
];

/** Texts shown in the game. */
export const copy = {
  title: 'Island Escape',
  story: [
    'A storm wrecked your boat on Dev Island.',
    'Collect the tech scattered across the island and visit every project site to rebuild it.',
    'Then sail home.',
  ],
  boatReady: 'Your boat is ready — go to the beach!',
  viewWork: 'View my work',
  contact: 'Contact me',
};
