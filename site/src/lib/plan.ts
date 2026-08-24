import { ROADMAP } from "@/data/roadmap";
import type { TrackId } from "@/data/types";
import { itemMinutes } from "@/lib/stats";
import { activeAlt } from "@/lib/tracks";

export interface PlanItem {
  id: string;
  pillarN: number;
  pillarTitle: string;
  subtopic: string;
  resourceName: string;
  url: string | null;
  minutes: number;
}

export interface PlanDay {
  dateISO: string; // YYYY-MM-DD
  items: PlanItem[];
  minutes: number;
}

export interface PlanWeek {
  index: number;
  startISO: string;
  endISO: string;
  days: PlanDay[];
  minutes: number;
}

export interface PlanOptions {
  hoursPerWeek: number;
  startDateISO?: string;
  completedIds?: Set<string>;
  track?: TrackId;
}

const DAY = 86400000;

/** Flatten remaining roadmap items in study order (courses excluded, dashboard convention). */
export function remainingItems(
  track: TrackId = "short",
  completedIds: Set<string> = new Set()
): PlanItem[] {
  const out: PlanItem[] = [];
  for (const p of ROADMAP.pillars) {
    const sections = p.sections.flatMap((s) => s.items.map((item) => ({ item })));
    const extras =
      track !== "short"
        ? (p.extras?.[track] ?? []).flatMap((g) => g.items.map((item) => ({ item })))
        : [];
    for (const { item } of [...sections, ...extras]) {
      if (completedIds.has(item.id)) continue;
      const alt = activeAlt(item, track);
      const minutes = itemMinutes(
        alt ? alt.urlType : item.urlType,
        alt ? alt.lengthMinutes : item.lengthMinutes
      );
      if (minutes === null || minutes <= 0) continue;
      out.push({
        id: item.id,
        pillarN: p.number,
        pillarTitle: p.title,
        subtopic: item.subtopic,
        resourceName: alt ? alt.resourceName : item.resourceName,
        url: alt ? alt.url : item.url,
        minutes,
      });
    }
  }
  return out;
}

function toISODay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Sequential day-by-day schedule. Daily capacity = weekly hours / 7.
 * An item longer than a day's capacity owns the whole day and spills into the next.
 */
export function buildPlan({ hoursPerWeek, startDateISO, completedIds, track }: PlanOptions): {
  weeks: PlanWeek[];
  totalHours: number;
  finishISO: string | null;
} {
  const items = remainingItems(track ?? "short", completedIds);
  if (items.length === 0) return { weeks: [], totalHours: 0, finishISO: null };

  const safeHrs = Math.min(60, Math.max(1, hoursPerWeek || 5));
  const dailyCapacity = (safeHrs * 60) / 7;

  const start = startDateISO ? new Date(startDateISO + "T00:00:00Z") : new Date();
  if (Number.isNaN(start.getTime())) throw new Error("bad start date");

  const weeks: PlanWeek[] = [];
  let week: PlanWeek | null = null;
  let day: PlanDay | null = null;
  let capacityLeft = 0;
  let totalMinutes = 0;
  let lastDay: Date | null = null;

  function ensureContainers(date: Date) {
    const iso = toISODay(date);
    if (!day || day.dateISO !== iso) {
      // new day → maybe new week
      const dow = (date.getUTCDay() + 6) % 7; // Mon=0
      const monday = new Date(date.getTime() - dow * DAY);
      const mondayISO = toISODay(monday);
      if (!week || week.startISO !== mondayISO) {
        week = {
          index: weeks.length + 1,
          startISO: mondayISO,
          endISO: toISODay(new Date(monday.getTime() + 6 * DAY)),
          days: [],
          minutes: 0,
        };
        weeks.push(week);
      }
      day = { dateISO: iso, items: [], minutes: 0 };
      week.days.push(day);
      week.minutes = week.minutes; // keep shape
      capacityLeft = dailyCapacity;
    }
  }

  for (const item of items) {
    let left = item.minutes;
    while (left > 0) {
      const cursor: Date = lastDay ?? new Date(start.getTime());
      ensureContainers(cursor);
      const take = Math.min(left, Math.max(capacityLeft, 0));
      const chunk = take > 0 ? take : Math.min(left, dailyCapacity); // long item claims the day
      day!.items.push({ ...item, minutes: Math.round(chunk) });
      day!.minutes += chunk;
      week!.minutes += chunk;
      totalMinutes += chunk;
      capacityLeft -= chunk;
      left -= chunk;
      if (capacityLeft <= 0 || chunk >= dailyCapacity) {
        lastDay = new Date(cursor.getTime() + DAY);
      } else {
        lastDay = cursor;
      }
    }
  }

  const finishISO = lastDay ? toISODay(new Date(lastDay.getTime())) : null;
  return {
    weeks,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    finishISO: finishISO ? advanceIfBefore(finishISO, toISODay(start)) : null,
  };
}

function advanceIfBefore(a: string, b: string): string {
  return a < b ? b : a;
}

// ---- iCal export ----

function icalEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function planToICal(weeks: PlanWeek[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Learn LLM Path//Plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Learn LLM Path",
  ];
  let seq = 0;
  for (const week of weeks) {
    for (const day of week.days) {
      for (const item of day.items) {
        seq++;
        const dt = day.dateISO.replace(/-/g, "");
        lines.push(
          "BEGIN:VEVENT",
          `UID:${item.id}-${seq}@learnllmpath.com`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
          `DTSTART;VALUE=DATE:${dt}`,
          `SUMMARY:[P${item.pillarN}] ${icalEscape(item.subtopic)} (${Math.round(item.minutes)}m)`,
          `DESCRIPTION:${icalEscape(item.resourceName)}${item.url ? ": " + item.url : ""}`,
          ...(item.url ? [`URL:${item.url}`] : []),
          "END:VEVENT"
        );
      }
    }
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
