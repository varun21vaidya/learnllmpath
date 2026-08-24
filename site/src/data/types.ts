export type ResourceKind = "video" | "doc" | "course" | "repo" | "read" | "unverified";
export type TrackId = "short" | "deep" | "free";
/** Alternative resource for a concept, from the deeper / 100%-free editions. */
export interface ItemAlt {
  resourceName: string;
  url: string | null;
  urlType: ResourceKind;
  lengthLabel: string;
  lengthMinutes: number | null;
}

export interface RoadmapItem {
  id: string;
  subtopic: string;
  resourceName: string;
  url: string | null;
  urlType: ResourceKind;
  lengthLabel: string;
  lengthMinutes: number | null;
  isKey: boolean;
  /** Present when the deep/free editions cover this same concept. */
  alt?: { deep?: ItemAlt; free?: ItemAlt };
}

export interface RoadmapSection {
  id: string;
  title: string;
  items: RoadmapItem[];
}

export interface Callout {
  sectionId: string;
  text: string;
}

export interface Pillar {
  number: number;
  slugId: string;
  title: string;
  focus: string;
  goal: string;
  sections: RoadmapSection[];
  callouts: Callout[];
  /** Track-only concepts with no counterpart in the short edition, grouped by source section. */
  extras?: Partial<Record<Exclude<TrackId, "short">, { sectionTitle: string; items: RoadmapItem[] }[]>>;
}

export interface SequenceRow {
  weeks: string;
  focus: string;
  resources: string;
  isKey: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
}

export interface RoadmapData {
  pillars: Pillar[];
  sequence: SequenceRow[];
  portfolio: PortfolioProject[];
  deliverableBar: string;
  /** ISO timestamp written by scripts/build-roadmap.ts at regeneration time. */
  generatedAt?: string;
}
