import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ItemAlt,
  Pillar,
  RoadmapData,
  RoadmapItem,
  ResourceKind,
  SequenceRow,
  PortfolioProject,
} from "../src/data/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, "../../LLM_Agentic_AI_Roadmap_Tracker.md");
const VARIANT_SOURCES: { path: string; track: "deep" | "free" }[] = [
  {
    path: resolve(__dirname, "../../deeeper_AI_Engineer_Roadmap_Zero_to_Job_Ready_roadmap.md"),
    track: "deep",
  },
  {
    path: resolve(__dirname, "../../free_AI_Engineer_Roadmap_100_Percent_Free.md"),
    track: "free",
  },
];
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

// ---- variant (deep/free) edition parsing ----

/** Phase N of the deep/free editions maps onto the 10-pillar spine. */
const PHASE_TO_PILLAR: Record<number, number | "p9-security-split" | null> = {
  0: null, // tooling setup, skipped
  1: 1,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 7,
  9: 8,
  10: "p9-security-split", // evals/observability → P9, OWASP/security → P10
  11: 9, // deployment/production lives beside observability
  12: null, // capstone, covered by the portfolio page
};

interface VariantItem {
  pillarN: number;
  sectionTitle: string;
  subtopic: string;
  resourceName: string;
  lengthLabel: string;
}

function normalizeSub(s: string): string {
  return s
    .replace(/\*\*\[KEY\]\*\*/gi, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\*\*/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(normalizeSub(s).split(" ").filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

/** Security-flavored rows from phase 10 belong to Pillar 10, not Pillar 9. */
function isSecurityRow(subtopic: string, resource: string): boolean {
  const s = normalizeSub(`${subtopic} ${resource}`);
  return /owasp|llm0\d|prompt injection|security/.test(s);
}

function parseVariantFile(path: string): VariantItem[] {
  const md = readFileSync(path, "utf-8");
  const lines = md.split(/\r?\n/);
  const out: VariantItem[] = [];
  let phaseN: number | null = null;
  let sectionTitle = "";

  for (const line of lines) {
    const phaseMatch = line.match(/^## Phase (\d+) — (.+)$/);
    if (phaseMatch) {
      phaseN = parseInt(phaseMatch[1], 10);
      sectionTitle = "";
      continue;
    }
    if (line.startsWith("## ")) {
      phaseN = null; // Portfolio / Suggested cadence etc.
      continue;
    }
    if (phaseN === null) continue;

    const sectionMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (sectionMatch && !/Total:/i.test(sectionMatch[1])) {
      sectionTitle = sectionMatch[1].trim();
      continue;
    }

    if (/^\|/.test(line)) {
      const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
      if (cells.length < 4 || cells[0] === "✅") continue;
      const [, subtopic, resource, length] = cells;
      if (subtopic.startsWith(":") || /^-+$/.test(subtopic)) continue;
      if (!subtopic || subtopic === "Subtopic") continue;

      const mapped = PHASE_TO_PILLAR[phaseN] ?? null;
      if (mapped === null) continue;
      const pillarN =
        mapped === "p9-security-split"
          ? isSecurityRow(subtopic, resource)
            ? 10
            : 9
          : mapped;
      out.push({
        pillarN,
        sectionTitle: sectionTitle || "Extras",
        subtopic: subtopic.replace(/\*\*/g, "").trim(),
        resourceName: resource.replace(/^[^\wA-Za-z]+\s*/u, "").replace(/\*\*/g, "").trim(),
        lengthLabel: length.trim(),
      });    }
  }
  return out;
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
    let cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    if (cells.length === 0) continue;
    if (/^[☐✅xX]$/.test(cells[0])) cells = cells.slice(1); // drop checkbox column
    if (cells.length < 3) continue;
    if (/^-*$/.test(cells[0]) || /^Weeks$/i.test(cells[0])) continue;
    sequence.push({
      weeks: cells[0],
      focus: cells[1].replace(/\*\*/g, "").replace(/\s*\[KEY\]\s*/gi, " ").trim(),
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

// ---- deep/free edition merge ----

function altFromVariant(v: VariantItem): ItemAlt {
  const linkEntry = links[v.resourceName];
  let urlType = classify(v.resourceName, v.lengthLabel);
  const url = linkEntry?.url ?? null;
  if (url) {
    if (/youtube\.com\/watch/.test(url)) urlType = "video";
    else if (/github\.com/.test(url)) urlType = "repo";
    else if (/udemy\.com/.test(url)) urlType = "course";
  }
  return {
    resourceName: v.resourceName,
    url,
    urlType,
    lengthLabel: v.lengthLabel,
    lengthMinutes: parseMinutes(v.lengthLabel),
  };
}

for (const { path, track } of VARIANT_SOURCES) {
  const variants = parseVariantFile(path);
  let attached = 0;
  const extraCount: number[] = [];

  for (const pillar of data.pillars) {
    const pool = pillar.sections.flatMap((s) => s.items);
    const byExact = new Map(pool.map((i) => [normalizeSub(i.subtopic), i]));
    const extrasBucket: { sectionTitle: string; items: RoadmapItem[] }[] = [];

    for (const v of variants.filter((x) => x.pillarN === pillar.number)) {
      const norm = normalizeSub(v.subtopic);
      const vTokens = tokens(v.subtopic);
      let best: RoadmapItem | null = byExact.get(norm) ?? null;
      if (!best) {
        let bestScore = 0;
        for (const candidate of pool) {
          const score = jaccard(vTokens, tokens(candidate.subtopic));
          if (score > bestScore) {
            bestScore = score;
            best = candidate;
          }
        }
        if (bestScore < 0.5) best = null;
      }

      const alt = altFromVariant(v);
      if (best) {
        best.alt = best.alt ?? {};
        best.alt[track] = alt;
        attached++;
      } else {
        // track-only concept: checkable under its own id, excluded from short-track totals
        const prefix = track === "deep" ? "d" : "f";
        let bucket = extrasBucket.find((b) => b.sectionTitle === v.sectionTitle);
        if (!bucket) {
          bucket = { sectionTitle: v.sectionTitle, items: [] };
          extrasBucket.push(bucket);
        }
        bucket.items.push({
          id: `${prefix}${pillar.number}-${slug(v.subtopic)}`,
          subtopic: v.subtopic,
          resourceName: v.resourceName,
          url: alt.url,
          urlType: alt.urlType,
          lengthLabel: alt.lengthLabel,
          lengthMinutes: alt.lengthMinutes,
          isKey: false,
        });
      }
    }

    if (extrasBucket.length > 0) {
      pillar.extras = pillar.extras ?? {};
      pillar.extras[track] = extrasBucket;
      extraCount.push(extrasBucket.reduce((n, b) => n + b.items.length, 0));
    }
  }

  console.log(
    `track ${track}: variants=${variants.length} attached=${attached} extras=${extraCount.reduce((a, b) => a + b, 0)}`
  );
}

// Sanitize AI-tell dashes from generated output. Sources stay untouched;
// applied AFTER links.json matching so resourceName keys keep resolving.
function deDash(s: string): string {
  return s.replace(/[—–]/g, "-");
}
function sanitizeStrings<T>(value: T): T {
  if (typeof value === "string") return deDash(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeStrings(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeStrings(v);
    }
    return out as unknown as T;
  }
  return value;
}
const cleanData = sanitizeStrings({ ...data, generatedAt: new Date().toISOString() });

const banner = `// AUTO-GENERATED by scripts/build-roadmap.ts. Edit LLM_Agentic_AI_Roadmap_Tracker.md and regenerate.
import type { RoadmapData } from "./types";

export const ROADMAP: RoadmapData = ${JSON.stringify(cleanData, null, 2)};
`;

writeFileSync(OUT, banner, "utf-8");
console.log(`wrote ${OUT}`);