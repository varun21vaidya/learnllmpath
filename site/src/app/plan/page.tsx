import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getProgress } from "@/lib/db";
import { remainingItems } from "@/lib/plan";
import { parseTrack } from "@/lib/tracks";
import { PlanBuilder } from "@/components/plan-builder";
import { TrackToggle } from "@/components/track-toggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learn LLM Path: Plan Generator",
  description:
    "Set your weekly hours and get a dated, week-by-week study schedule for the LLM & Agentic AI roadmap, with calendar export.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const sp = await searchParams;
  const track = parseTrack(sp.track);
  const session = await auth();
  let completed = new Set<string>();
  if (session?.user?.id) {
    try {
      completed = await getProgress(session.user.id);
    } catch {}
  }
  const items = remainingItems(track, completed);

  return (
    <main className="nb-page nb-stack-lg pt-6">
      <header className="nb-stack">
        <h1 className="nb-title">Build your plan</h1>
        <p className="nb-subtitle max-w-2xl">
          Pick a pace and we distribute every remaining roadmap resource across your week
          and generate a calendar you can import anywhere.
          {completed.size > 0 && ` ${completed.size} already-completed items are excluded.`}
        </p>
        <TrackToggle path="/plan" active={track} />
      </header>
      <PlanBuilder items={items} />
    </main>
  );
}
