import Link from "next/link";
import { auth } from "@/lib/auth";
import { getProgress, getQuizBests } from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";
import { computeStats, computeStreak, getCompletionDatesSafe } from "@/lib/home-data";
import { pillarAccent } from "@/lib/ui";
import { slugForPillar } from "@/data/pillar-slugs";
import { TrackToggle } from "@/components/track-toggle";
import { parseTrack } from "@/lib/tracks";
import { ProgressRing } from "@/components/progress-ring";
import { PillarRail } from "@/components/pillar-rail";
import { ArrowRightIcon, CalendarIcon, RepeatIcon, TrophyIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

function pillarHref(n: number, track: string): string {
  return track === "short"
    ? `/pillars/${slugForPillar(n)}`
    : `/pillars/${slugForPillar(n)}?track=${track}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const sp = await searchParams;
  const track = parseTrack(sp.track);
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const userId = session?.user?.id ?? null;

  let progress = new Set<string>();
  let bests = new Map<number, { passed: boolean; best_pct: number }>();
  let dates: string[] = [];

  if (userId) {
    try {
      [progress, bests, dates] = await Promise.all([
        getProgress(userId),
        getQuizBests(userId),
        getCompletionDatesSafe(userId),
      ]);
    } catch {
      // DB unavailable: public roadmap without tracker state
    }
  }

  const stats = computeStats(progress);
  const streak = computeStreak(dates);
  const currentPillar =
    ROADMAP.pillars.find((p) => {
      const items = p.sections.flatMap((s) => s.items);
      return items.some((i) => !progress.has(i.id));
    }) ?? ROADMAP.pillars[ROADMAP.pillars.length - 1];
  const completedPillars = ROADMAP.pillars.map((pillar) => {
    const items = pillar.sections.flatMap((section) => section.items);
    return items.length > 0 && items.every((item) => progress.has(item.id));
  });

  const faqs = [
    {
      q: "Is Learn LLM Path really free?",
      a: "Yes — every pillar and resource is browsable with no account; sign in only to save progress.",
    },
    {
      q: "Do I need math or machine learning background?",
      a: "No — just basic Python and curiosity.",
    },
    {
      q: "How long does the roadmap take?",
      a: "About 17 weeks at 1–1.5 hrs/weekday, ~30% faster full-time.",
    },
    {
      q: "What makes this different from other AI roadmaps?",
      a: "Most curricula cover 1 of the 10 OWASP Top 10 for LLM risks; this roadmap covers all ten, with evals and security as first-class, quiz-gated pillars.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        name: "Learn LLM Path",
        url: "https://learnllmpath.com",
        description:
          "Free, step-by-step roadmap covering LLM fundamentals through agentic AI: RAG, agents, MCP, evals and security, with quizzes, spaced review and study plans.",
      },
      {
        "@type": "ItemList",
        name: "Learn LLM Path roadmap modules",
        itemListElement: ROADMAP.pillars.map((p) => ({
          "@type": "ListItem",
          position: p.number,
          name: `Pillar ${p.number}: ${p.title}`,
          url: `https://learnllmpath.com/pillars/${slugForPillar(p.number)}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="nb-page nb-stack-lg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="nb-hero nb-stack">
        <div className="nb-eyebrow">A structured route through modern AI</div>
        <h1 className="nb-title max-w-4xl text-5xl sm:text-7xl">Learn LLM Path</h1>
        <p className="nb-hero-copy max-w-3xl">
          The step-by-step roadmap from LLM fundamentals to reliable agentic AI. Ten connected
          pillars, curated resources, and a clear next step every time you return.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/plan" className="nb-btn nb-btn-primary">
            <CalendarIcon /> Build your plan <ArrowRightIcon />
          </Link>
          <TrackToggle path="/" active={track} />
        </div>
      </header>

      {!signedIn && (
        <div className="nb-callout font-semibold">
          You are browsing read-only.{" "}
          <Link href="/login" className="underline decoration-2 underline-offset-2">
            Sign in
          </Link>{" "}
          to check off items and save notes.
        </div>
      )}

      {signedIn && stats.totalItems > 0 && (
        <section className="nb-card nb-p-4 nb-stack">
          <div className="flex justify-between items-baseline">
            <h2 className="font-black text-lg">
              Your progress{" "}
              {streak.current > 0 && <span title="day streak">{streak.current} day streak</span>}
            </h2>
            <span className="font-mono font-bold text-sm">
              {stats.doneItems}/{stats.totalItems} · {stats.overallPct}%
            </span>
          </div>
          <div
            className="nb-progress-track"
            role="progressbar"
            aria-valuenow={stats.overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall roadmap completion"
          >
            <div className="nb-progress-fill" style={{ width: `${stats.overallPct}%` }} />
          </div>
          <p className="text-xs font-mono text-muted">
            Up next:{" "}
            <Link href={`/pillars/${slugForPillar(currentPillar.number)}`} className="underline font-bold">
              Pillar {currentPillar.number}: {currentPillar.title}
            </Link>{" "}
            · {stats.hoursRemaining}h of timed content left
          </p>
        </section>
      )}

      <section id="curriculum" className="nb-stack scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="nb-stack">
            <div className="nb-eyebrow">The path</div>
            <h2 className="text-2xl font-black">Ten pillars. One sequence.</h2>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
              Each pillar closes a different gap, then hands you the concepts needed for the next.
            </p>
          </div>
          <PillarRail current={currentPillar.number} completed={completedPillars} />
        </div>
        <div className="nb-pillar-grid">
          {ROADMAP.pillars.map((pillar) => {
            const items = pillar.sections.flatMap((s) => s.items);
            const done = items.filter((i) => progress.has(i.id)).length;
            const pct = items.length ? Math.round((done / items.length) * 100) : 0;
            const quiz = bests.get(pillar.number);
            const minutes = items.reduce((sum, item) => sum + (item.lengthMinutes ?? 0), 0);
            return (
              <Link
                key={pillar.slugId}
                href={pillarHref(pillar.number, track)}
                className="nb-card nb-p-5 nb-stack nb-pillar-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`${pillarAccent(pillar.number)} nb-badge`}>P{pillar.number}</span>
                  <ProgressRing pct={pct} size={48} label={`${pillar.title} progress`} />
                </div>
                <h3 className="text-lg font-black leading-tight">{pillar.title}</h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted">{pillar.goal}</p>
                <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t-2 border-dashed border-line pt-3 font-mono text-[11px] text-muted">
                  <span>{Math.floor(minutes / 60)}h {minutes % 60}m</span>
                  <span>{items.length} resources</span>
                  {quiz?.passed && <span className="text-success">Quiz passed</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="nb-stack">
        <h2 className="text-xl font-black">Who this roadmap is for</h2>
        <ul className="nb-stack max-w-3xl text-[15px] leading-relaxed list-disc pl-5">
          <li>Beginners with basic Python who want structure instead of another hype thread.</li>
          <li>Career switchers who need an honest path from zero to job-ready.</li>
          <li>Working developers closing the gap between chatbot demos and reliable agents.</li>
        </ul>
      </section>

      <section className="nb-action-grid">
        <Link href="/plan" className="nb-action-card nb-action-primary">
          <CalendarIcon />
          <span><strong>Build your plan</strong><small>Turn the path into a dated weekly schedule.</small></span>
          <ArrowRightIcon />
        </Link>
        <Link href="/review" className="nb-action-card">
          <RepeatIcon />
          <span><strong>Review</strong><small>Bring missed questions back into focus.</small></span>
          <ArrowRightIcon />
        </Link>
        <Link href="/leaderboard" className="nb-action-card">
          <TrophyIcon />
          <span><strong>Leaderboard</strong><small>See the community moving through the path.</small></span>
          <ArrowRightIcon />
        </Link>
      </section>

      <section className="nb-support-grid">
        <div className="nb-stack">
          <div className="nb-eyebrow">Why this path</div>
          <h2 className="text-xl font-black">Close the gaps that demos hide.</h2>
          <p className="text-sm leading-relaxed text-muted">
            Evals and security are first-class pillars here, with quiz gates that keep weak spots
            from quietly following you forward.
          </p>
        </div>
        <div className="nb-stack">
          <div className="nb-eyebrow">Built for</div>
          <p className="text-sm leading-relaxed text-muted">
            Beginners with basic Python, career switchers who want structure, and developers
            turning chatbot experiments into reliable agents.
          </p>
        </div>
      </section>

      <section className="nb-stack">
        <h2 className="text-xl font-black">Frequently asked questions</h2>
        <div className="nb-stack max-w-3xl">
          {faqs.map((f) => (
            <details key={f.q} className="nb-card nb-p-4">
              <summary className="font-black cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="nb-callout font-semibold max-w-3xl">
        Pick a track above, open{" "}
        <Link href={pillarHref(1, track)} className="underline decoration-2 underline-offset-2">
          Pillar 1: Transformer &amp; LLM Internals
        </Link>
        , and check your first box today.
      </section>
    </main>
  );
}
