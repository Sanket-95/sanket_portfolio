import { caseStudies, demos, websites } from '@/data/work';
import type { Site } from './island';

/** The text a project card shows, read from src/data/work.ts. */
export interface ProjectInfo {
  title: string;
  /** Context and period, e.g. "Cipla Ltd., Goa (on-site) · Aug – Sep 2023". */
  eyebrow: string;
  summary: string;
  points: string[];
  tags: string[];
}

export function projectInfo(site: Site): ProjectInfo {
  const { list, id } = site.source;
  if (list === 'caseStudies') {
    const c = caseStudies.find((x) => x.id === id);
    if (c) {
      return {
        title: c.title,
        eyebrow: [c.context, c.period].filter(Boolean).join(' · '),
        summary: c.summary,
        points: c.points,
        tags: c.stack,
      };
    }
  } else {
    const w = (list === 'websites' ? websites : demos).find((x) => x.id === id);
    if (w) return { title: w.title, eyebrow: w.category, summary: w.summary, points: [], tags: w.highlights };
  }
  throw new Error(`Island Escape: no ${list} entry "${id}" in src/data/work.ts`);
}
