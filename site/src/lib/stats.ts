import { ROADMAP } from "@/data/roadmap";

export const UNTIMED_MINUTES = 20;

export interface RoadmapStats {
  overallPct: number;
  hoursRemaining: number;
  doneItems: number;
  totalItems: number;
}

export function itemMinutes(urlType: string, lengthMinutes: number | null): number | null {
  if (urlType === "course") return null;
  return lengthMinutes ?? (urlType === "video" ? 30 : UNTIMED_MINUTES);
}

export function computeStats(completedIds: Set<string>): RoadmapStats {
  let totalMinutes = 0;
  let doneTimedMinutes = 0;
  let totalItems = 0;
  let doneItems = 0;

  for (const p of ROADMAP.pillars) {
    for (const s of p.sections) {
      for (const item of s.items) {
        const minutes = itemMinutes(item.urlType, item.lengthMinutes);
        if (minutes === null) continue; // courses excluded from hour estimates
        totalItems++;
        totalMinutes += minutes;
        if (completedIds.has(item.id)) {
          doneItems++;
          doneTimedMinutes += minutes;
        }
      }
    }
  }
  return {
    overallPct: totalItems ? Math.round((doneItems / totalItems) * 100) : 0,
    hoursRemaining: Math.max(0, Math.round(((totalMinutes - doneTimedMinutes) / 60) * 10) / 10),
    doneItems,
    totalItems,
  };
}

export function computeStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 1 };
  const sorted = [...new Set(dates)].sort();
  const DAY = 86400000;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = (Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / DAY;
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - DAY).toISOString().slice(0, 10);
  const last = sorted[sorted.length - 1];
  let current = 0;
  if (last === today || last === yesterday) {
    current = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      const gap = (Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / DAY;
      if (gap === 1) current++;
      else break;
    }
  }
  return { current, longest: longest || 1 };
}

/** Completions per ISO-week bucket (Monday start) for the last `weeks` weeks. */
export function weeklyVelocity(dates: string[], weeks = 8): { weekStart: string; count: number }[] {
  const buckets: { weekStart: string; count: number }[] = [];
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7; // Mon=0
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(monday.getTime() - i * 7 * 86400000);
    buckets.push({ weekStart: d.toISOString().slice(0, 10), count: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.weekStart, i]));
  for (const date of new Set(dates)) {
    const d = new Date(date + "T00:00:00Z");
    const dday = (d.getUTCDay() + 6) % 7;
    const ws = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dday))
      .toISOString()
      .slice(0, 10);
    const bi = index.get(ws);
    if (bi !== undefined) buckets[bi].count++;
  }
  return buckets;
}

/** ETA in whole weeks given remaining items and recent completions per week. */
export function etaWeeks(remainingItems: number, recentPerWeek: number): number | null {
  if (remainingItems <= 0) return 0;
  if (recentPerWeek <= 0) return null;
  return Math.ceil(remainingItems / recentPerWeek);
}

export function etaDateString(weeksFromNow: number): string {
  return new Date(Date.now() + weeksFromNow * 7 * 86400000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
