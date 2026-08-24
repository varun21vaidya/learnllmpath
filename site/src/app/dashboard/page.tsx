import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProgress, getQuizBests } from "@/lib/db";
import { getCompletionDatesSafe } from "@/lib/home-data";
import { ROADMAP } from "@/data/roadmap";
import { computeStats, computeStreak, weeklyVelocity, etaWeeks, etaDateString } from "@/lib/stats";
import { pillarAccent } from "@/lib/ui";
import { slugForPillar } from "@/data/pillar-slugs";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Learn LLM Path: Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  let completedIds = new Set<string>();
  let bests = new Map<number, { best_pct: number; passed: boolean }>();
  let dates: string[] = [];
  let dbError: string | null = null;
  try {
    [completedIds, bests, dates] = await Promise.all([
      getProgress(userId),
      getQuizBests(userId),
      getCompletionDatesSafe(userId),
    ]);
  } catch (err) {
    dbError = String((err as Error)?.message ?? err).slice(0, 160);
    console.error("[dashboard] query failed:", err);
  }

  const stats = computeStats(completedIds);
  const streak = computeStreak(dates);
  const weeks = weeklyVelocity(dates, 8);
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));
  const last4 = weeks.slice(-4);
  const perWeek = Math.round((last4.reduce((n, w) => n + w.count, 0) / 4) * 10) / 10;
  const remaining = stats.totalItems - stats.doneItems;
  const eta = etaWeeks(remaining, perWeek);
  const etaDate = eta !== null ? etaDateString(eta) : null;

  return (
    <main className="nb-page nb-stack-lg">
      <header className="nb-stack pt-6 pb-2 flex flex-wrap items-end justify-between gap-4">
        <div className="nb-stack">
          <h1 className="nb-title">Dashboard</h1>
          <p className="nb-subtitle">Your progress across all 10 pillars.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="nb-card nb-p-3 text-center min-w-24">
            <p className="font-black text-2xl">{streak.current}</p>
            <p className="text-[10px] font-mono uppercase">day streak</p>
          </div>
          <div className="nb-card nb-p-3 text-center min-w-24">
            <p className="font-black text-2xl">{streak.longest}</p>
            <p className="text-[10px] font-mono uppercase">best streak</p>
          </div>
          <div className="nb-card nb-p-3 text-center min-w-28">
            <p className="font-black text-2xl">{stats.hoursRemaining}h</p>
            <p className="text-[10px] font-mono uppercase">left (timed)</p>
          </div>
          <div className="nb-card nb-card-accent nb-p-3 text-center min-w-28">
            <p className="font-black text-2xl">{stats.overallPct}%</p>
            <p className="text-[10px] font-mono uppercase">complete</p>
          </div>
        </div>
      </header>

      {dbError && (
        <div className="nb-callout font-bold">
          Database error: <code className="font-mono text-xs">{dbError}</code>
          <div className="text-sm font-semibold mt-1">
            Apply <code className="font-mono text-xs">site/schema.sql</code> in Supabase SQL
            Editor, then reload.
          </div>
        </div>
      )}

      <section className="nb-card nb-p-5 nb-stack">
        <div className="flex justify-between items-baseline">
          <h2 className="font-black text-lg">Overall</h2>
          <span className="font-mono font-bold">
            {stats.doneItems}/{stats.totalItems} items · {stats.overallPct}%
          </span>
        </div>
        <div
          className="nb-progress-track"
          role="progressbar"
          aria-valuenow={stats.overallPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="nb-progress-fill" style={{ width: `${stats.overallPct}%` }} />
        </div>
        <p className="text-xs font-mono text-muted">
          {eta !== null ? (
            <>
              At your pace of <strong>{perWeek} items/week</strong>, you finish in ~{eta} week
              {eta === 1 ? "" : "s"}, around{" "}
              <strong className="underline decoration-2 underline-offset-2">{etaDate}</strong>.{" "}
              <Link href="/plan" className="underline font-bold">
                Build a plan →
              </Link>
            </>
          ) : remaining > 0 ? (
            <>
              Complete a few items this week and we&apos;ll project your finish date.{" "}
              <Link href="/plan" className="underline font-bold">
                Set a schedule →
              </Link>
            </>
          ) : (
            <>Roadmap complete. Time to ship portfolio projects!</>
          )}
        </p>
      </section>

      <section className="nb-card nb-p-5 nb-stack">
        <h2 className="font-black text-lg">Velocity: last 8 weeks</h2>
        <div className="flex items-end justify-between gap-2 h-32" role="img" aria-label="Items completed per week, last 8 weeks">
          {weeks.map((w) => (
            <div key={w.weekStart} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
              <span className="font-mono text-[10px] font-bold">{w.count || ""}</span>
              <div
                className={`w-full border-3 border-ink ${w.count > 0 ? "bg-primary" : "bg-surface opacity-40"}`}
                style={{ height: `${Math.max(4, (w.count / maxCount) * 100)}%` }}
                title={`${w.count} completed week of ${w.weekStart}`}
              />
              <span className="font-mono text-[9px] text-muted">
                {new Date(w.weekStart + "T00:00:00Z").toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {ROADMAP.pillars.map((pillar) => {
          const items = pillar.sections.flatMap((s) => s.items);
          const done = items.filter((i) => completedIds.has(i.id)).length;
          const pct = items.length ? Math.round((done / items.length) * 100) : 0;
          const best = bests.get(pillar.number);
          return (
            <div key={pillar.slugId} className="nb-card nb-p-4 nb-stack">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm leading-tight">
                  <Link href={`/pillars/${slugForPillar(pillar.number)}`} className="hover:underline">
                    <span className={`${pillarAccent(pillar.number)} nb-badge mr-2`}>{pillar.number}</span>
                    {pillar.title}
                  </Link>
                </h3>
                {best && (
                  <span
                    className={`nb-badge ${best.passed ? "nb-badge-repo" : "nb-badge-unverified"}`}
                    title="Best quiz score"
                  >
                    quiz {best.best_pct}%
                  </span>
                )}
              </div>
              <div
                className="nb-progress-track h-4!"
                role="progressbar"
                aria-label={`${pillar.title} completion`}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="nb-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span>
                  {done}/{items.length} done · {pct}%
                </span>
                {!best && (
                  <Link href={`/quiz/${pillar.number}`} className="underline font-bold">
                    take quiz
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <p className="text-xs font-mono opacity-70">
        Hour estimate convention: videos use source lengths; articles/docs count as{" "}
        {20} min each; Udemy courses excluded.
      </p>
    </main>
  );
}
