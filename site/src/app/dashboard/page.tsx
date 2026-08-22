import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProgress, getQuizBests } from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — skilllog" };

const UNTIMED_MINUTES = 20;

function computeStats(completedIds: Set<string>) {
  let totalMinutes = 0;
  let doneTimedMinutes = 0;
  let totalItems = 0;
  let doneItems = 0;

  for (const p of ROADMAP.pillars) {
    for (const s of p.sections) {
      for (const item of s.items) {
        if (item.urlType === "course") continue; // courses excluded from hour estimates
        totalItems++;
        const minutes = item.lengthMinutes ?? (item.urlType === "video" ? null : UNTIMED_MINUTES);
        if (minutes) totalMinutes += minutes;
        if (completedIds.has(item.id)) {
          doneItems++;
          if (minutes) doneTimedMinutes += minutes;
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

function computeStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
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
  return { current, longest };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  let completedIds = new Set<string>();
  let bests = new Map<number, { best_pct: number; passed: boolean }>();
  let dates: string[] = [];
  let dbError = false;
  try {
    [completedIds, bests, dates] = await Promise.all([
      getProgress(userId),
      getQuizBests(userId),
      getCompletionDatesSafe(userId),
    ]);
  } catch {
    dbError = true;
  }

  const stats = computeStats(completedIds);
  const streak = computeStreak(dates);

  return (
    <main className="nb-page nb-stack-lg">
      <header className="nb-stack pt-6 pb-2 flex flex-wrap items-end justify-between gap-4">
        <div className="nb-stack">
          <h1 className="nb-title">Dashboard</h1>
          <p className="nb-subtitle">Your progress across all 10 pillars.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="nb-card nb-p-3 text-center min-w-24">
            <p className="font-black text-2xl">🔥 {streak.current}</p>
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
        </div>
      </header>

      {dbError && (
        <div className="nb-callout font-bold">
          Database not configured yet — set DATABASE_URL in .env.local to see your live stats.
        </div>
      )}

      <section className="nb-card nb-p-5 nb-stack">
        <div className="flex justify-between items-baseline">
          <h2 className="font-black text-lg">Overall</h2>
          <span className="font-mono font-bold">
            {stats.doneItems}/{stats.totalItems} items · {stats.overallPct}%
          </span>
        </div>
        <div className="nb-progress-track" role="progressbar" aria-valuenow={stats.overallPct} aria-valuemin={0} aria-valuemax={100}>
          <div className="nb-progress-fill" style={{ width: `${stats.overallPct}%` }} />
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
                  <span className="font-mono mr-1">{pillar.number}.</span>
                  {pillar.title}
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
                className="nb-progress-track !h-4"
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
        {UNTIMED_MINUTES} min each; Udemy courses excluded.
      </p>
    </main>
  );
}

async function getCompletionDatesSafe(userId: string): Promise<string[]> {
  const { getCompletionDates } = await import("@/lib/db");
  return getCompletionDates(userId);
}
