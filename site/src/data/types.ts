export type ResourceKind = "video" | "doc" | "course" | "repo" | "read" | "unverified";

export interface RoadmapItem {
  id: string;
  subtopic: string;
  resourceName: string;
  url: string | null;
  urlType: ResourceKind;
  lengthLabel: string;
  lengthMinutes: number | null;
  isKey: boolean;
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
}
