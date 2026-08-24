"use client";

import { useMemo, useState } from "react";
import { buildPlan, planToICal, type PlanItem } from "@/lib/plan";

const PRESETS = [3, 5, 8, 12, 20];

function prettyDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function PlanBuilder({ items }: { items: PlanItem[] }) {
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  const plan = useMemo(
    () => buildPlan({ hoursPerWeek, startDateISO: startDate }),
    [hoursPerWeek, startDate]
  );

  const finish = plan.finishISO
    ? new Date(plan.finishISO + "T00:00:00Z").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  function downloadICal() {
    const blob = new Blob([planToICal(plan.weeks)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learn-llm-path.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="nb-stack-lg">
      <section className="nb-card nb-p-4 nb-stack">
        <h2 className="font-black text-lg">1. Set your pace</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Hours per week:</span>
          {PRESETS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHoursPerWeek(h)}
              aria-pressed={hoursPerWeek === h}
              className={`nb-btn nb-btn-small ${hoursPerWeek === h ? "nb-btn-primary" : "bg-surface"}`}
            >
              {h}h
            </button>
          ))}
          <label className="flex items-center gap-1 text-xs font-mono">
            custom:
            <input
              type="number"
              min={1}
              max={60}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value) || 1)}
              className="nb-input w-20! py-0.5!"
            />
          </label>
        </div>
        <label className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          Start date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="nb-input w-auto!"
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="nb-card nb-p-4 text-center">
          <p className="font-black text-2xl">{items.length}</p>
          <p className="text-[10px] font-mono uppercase">resources to cover</p>
        </div>
        <div className="nb-card nb-p-4 text-center">
          <p className="font-black text-2xl">{plan.totalHours}h</p>
          <p className="text-[10px] font-mono uppercase">timed content</p>
        </div>
        <div className="nb-card nb-p-4 text-center">
          <p className="font-black text-2xl">{finish ? plan.weeks.length : "-"}</p>
          <p className="text-[10px] font-mono uppercase">weeks needed</p>
        </div>
      </section>

      {finish && (
        <section className="nb-callout font-bold">
          At {hoursPerWeek}h/week you finish around{" "}
          <strong className="underline decoration-2 underline-offset-2">{finish}</strong>.
        </section>
      )}

      <button type="button" onClick={downloadICal} className="nb-btn nb-btn-primary w-fit">
        Download calendar (.ics)
      </button>

      <section className="nb-stack">
        <h2 className="font-black text-lg">Your week-by-week schedule</h2>
        {plan.weeks.map((week) => (
          <div key={week.index} className="nb-card nb-p-4 nb-stack">
            <div className="flex justify-between items-baseline">
              <h3 className="font-black">
                Week {week.index}{" "}
                <span className="font-mono text-xs font-normal text-muted">
                  ({prettyDate(week.startISO)} – {prettyDate(week.endISO)})
                </span>
              </h3>
              <span className="font-mono text-xs">{Math.round(week.minutes / 6) / 10}h</span>
            </div>
            <ul className="divide-y divide-dashed divide-line">
              {week.days.flatMap((day) =>
                day.items.map((item) => (
                  <li key={`${item.id}-${day.dateISO}`} className="py-1.5 flex gap-3 text-sm">
                    <span className="font-mono text-xs text-muted w-16 shrink-0 pt-0.5">
                      {prettyDate(day.dateISO)}
                    </span>
                    <span className="min-w-0">
                      <strong>{item.subtopic}</strong>{" "}
                      <span className="text-xs text-muted">
                        · P{item.pillarN} · {Math.round(item.minutes)}m
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
