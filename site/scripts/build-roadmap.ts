import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Pillar,
  RoadmapData,
  RoadmapItem,
  ResourceKind,
  SequenceRow,
  PortfolioProject,
} from "../src/data/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, "../../LLM_Agentic_AI_Roadmap_Tracker.md");
const OUT = resolve(__dirname, "../src/data/roadmap.ts");

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\*\*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

function parseMinutes(label: string): number | null {
  const h = label.match(/(\d+(?:\.\d+)?)\s*h/);
  const m = label.match(/(\d+)\s*m/);
  if (!h && !m) return null;
  return (h ? parseFloat(h[1]) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

function classify(resource: string, length: string): ResourceKind {
  const r = resource.toLowerCase();
  if (/udemy/.test(r) || /udemy/.test(length.toLowerCase())) return "course";
  if (/github|repo\b/.test(r)) return "repo";
  if (/docs?\b/.test(r)) return "doc";
  if (/read/.test(length.toLowerCase()) || /\bread\b/.test(r)) return "read";
  return "video";
}

const md = readFileSync(SOURCE, "utf-8");
const lines = md.split(/\r?\n/);

const pillars: Pillar[] = [];
const sequence: SequenceRow[] = [];
const portfolio: PortfolioProject[] = [];
let deliverableBar = "";

let current: Pillar | null = null;
let currentSectionId = "";
let mode: "roadmap" | "sequence" | "portfolio" | "none" = "none";

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const pillarMatch = line.match(/^## Pillar (\d+) — (.+)$/);
  if (pillarMatch) {
    current = {
      number: parseInt(pillarMatch[1], 10),
      slugId: `pillar-${pillarMatch[1]}`,
      title: pillarMatch[2].trim(),
      focus: "",
      goal: "",
      sections: [],
      callouts: [],
    };
    pillars.push(current);
    mode = "roadmap";
    currentSectionId = "";
    continue;
  }

  if (line.startsWith("## Suggested Sequence")) {
    mode = "sequence";
    current = null;
    continue;
  }
  if (line.startsWith("## Portfolio")) {
    mode = "portfolio";
    continue;
  }

  if (mode === "roadmap" && current) {
    if (!current.focus) {
      const focusMatch = line.match(/^\*Focus: (.+)\*$/);
      if (focusMatch) current.focus = focusMatch[1].trim();
    }
    if (!current.goal && /^Goal: /.test(line)) {
      current.goal = line.replace(/^Goal: /, "").replace(/\*$/, "").trim();
    }
    if (!current.goal) {
      const goalMatch = line.match(/^\*Goal: (.+?)\.?\s*\*?$/);
      if (goalMatch) current.goal = goalMatch[1].trim();
    }

    const sectionMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (sectionMatch) {
      currentSectionId = `${current.slugId}-${slug(sectionMatch[1])}`;
      if (!current.sections.some((s) => s.id === currentSectionId)) {
        current.sections.push({ id: currentSectionId, title: sectionMatch[1].trim(), items: [] });
      }
      continue;
    }

    const calloutMatch = line.match(/^> 🟡 \*\*(.+?)\*\*:?(.*)$/);
    if (calloutMatch) {
      const full = `${calloutMatch[1]}${calloutMatch[2] ? ": " + calloutMatch[2].trim() : ""}`.trim();
      current.callouts.push({
        sectionId: currentSectionId || current.sections[0]?.id || current.slugId,
        text: full,
      });
      continue;
    }

    if (/^\|/.test(line)) {
      const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
      if (cells.length < 4 || cells[0] === "✅") continue;
      const [, subtopic, resource, length] = cells;
      if (subtopic === ":---" || subtopic.startsWith("-")) continue;
      const isKey = subtopic.includes("**[KEY]**") || resource.includes("**[KEY]**");
      const cleanSub = subtopic.replace(/\*\*\[KEY\]\*\*/g, "").replace(/\*\*/g, "").trim();
      const section =
        current.sections.find((s) => s.id === currentSectionId) ??
        current.sections[current.sections.length - 1];
      const targetSection =
        section ?? { id: current.slugId, title: "Core", items: [] as RoadmapItem[] };
      if (!current.sections.some((s) => s.id === targetSection.id)) {
        current.sections.push(targetSection);
        currentSectionId = targetSection.id;
      }
      targetSection.items.push({
        id: `p${current.number}-${slug(cleanSub)}`,
        subtopic: cleanSub,
        resourceName: resource.replace(/\*\*/g, "").trim(),
        url: null,
        urlType: classify(resource, length),
        lengthLabel: length.trim(),
        lengthMinutes: parseMinutes(length),
        isKey,
      });
    }
  }

  if (mode === "sequence" && /^\|/.test(line)) {
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    if (cells.length < 3 || cells[0] === "✅") continue;
    if (/^Weeks|^:---/.test(cells[0])) continue;
    sequence.push({
      weeks: cells[0],
      focus: cells[1].replace(/\*\*/g, "").trim(),
      resources: cells.slice(2).join(" · ").trim(),
      isKey: cells[1].includes("[KEY]"),
    });
  }

  if (mode === "portfolio" && /^\| ☐/.test(line)) {
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    portfolio.push({ id: slug(cells[1]).slice(0, 40), title: cells[1] });
  }
  if (mode === "portfolio" && /^\*\*Deliverable bar:\*\*/.test(line)) {
    deliverableBar = line.replace(/\*\*/g, "").replace(/^Deliverable bar: /, "").trim();
  }
}

const itemCount = pillars.reduce(
  (n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0),
  0
);
const calloutCount = pillars.reduce((n, p) => n + p.callouts.length, 0);
const keyCount = pillars.reduce(
  (n, p) => n + p.sections.reduce((m, s) => m + s.items.filter((i) => i.isKey).length, 0),
  0
);

console.log(`pillars=${pillars.length} items=${itemCount} keyItems=${keyCount} callouts=${calloutCount} sequenceRows=${sequence.length} portfolio=${portfolio.length}`);

if (pillars.length !== 10) throw new Error(`Expected 10 pillars, got ${pillars.length}`);
if (itemCount < 40 || itemCount > 70) throw new Error(`Unexpected item count ${itemCount}`);
if (calloutCount < 6) throw new Error(`Lost callouts: ${calloutCount}`);

const data: RoadmapData = { pillars, sequence, portfolio, deliverableBar };

// Merge researched links (scripts/links.json) into items before writing.
const linksPath = resolve(__dirname, "links.json");
const links: Record<string, { url: string | null; confidence: string }> = JSON.parse(
  readFileSync(linksPath, "utf-8")
);
let matched = 0;
const missing: string[] = [];
for (const pillar of data.pillars) {
  for (const section of pillar.sections) {
    for (const item of section.items) {
      const entry = links[item.resourceName];
      if (!entry) {
        missing.push(item.resourceName);
        continue;
      }
      item.url = entry.url;
      if (entry.url) {
        if (/youtube\.com\/watch/.test(entry.url)) item.urlType = "video";
        else if (/github\.com/.test(entry.url)) item.urlType = "repo";
        else if (/udemy\.com\/courses\/search/.test(entry.url)) item.urlType = "course";
        else if (item.urlType === "video") item.urlType = entry.confidence === "search-page" ? "course" : "read";
        else if (entry.confidence === "uncertain" || !entry.url) item.urlType = "unverified";
      } else {
        item.urlType = "unverified";
      }
      matched++;
    }
  }
}
console.log(`links: matched=${matched} missing=${missing.length}`);
if (missing.length > 0) console.log("MISSING LINK ENTRIES:\n" + missing.join("\n"));

const banner = `// AUTO-GENERATED by scripts/build-roadmap.ts — edit LLM_Agentic_AI_Roadmap_Tracker.md and regenerate.
import type { RoadmapData } from "./types";

export const ROADMAP: RoadmapData = ${JSON.stringify(data, null, 2)};
`;

writeFileSync(OUT, banner, "utf-8");
console.log(`wrote ${OUT}`);
