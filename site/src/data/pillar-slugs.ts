import { ROADMAP } from "./roadmap";
import type { Pillar } from "./types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const bySlug = new Map<string, Pillar>();
const slugByNumber = new Map<number, string>();

for (const pillar of ROADMAP.pillars) {
  const slug = `${slugify(pillar.title)}-p${pillar.number}`;
  bySlug.set(slug, pillar);
  slugByNumber.set(pillar.number, slug);
}

export function pillarBySlug(slug: string): Pillar | undefined {
  return bySlug.get(slug);
}

export function slugForPillar(n: number): string {
  return slugByNumber.get(n) ?? "";
}

export const ALL_PILLAR_SLUGS = [...bySlug.keys()];
