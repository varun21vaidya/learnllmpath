import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loadDueQuestions, loadSrsStats, type SafeQuestion } from "@/lib/actions/srs";
import { ReviewRunner } from "@/components/review-runner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learn LLM Path: Review",
  description: "Spaced-repetition review of quiz questions you missed.",
};

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let due: SafeQuestion[] = [];
  let stats = { due: 0, scheduled: 0 };
  try {
    [due, stats] = await Promise.all([loadDueQuestions(), loadSrsStats()]);
  } catch {}

  return (
    <main className="nb-page nb-center">
      <div className="w-full max-w-2xl nb-stack-lg">
        <Link href="/" className="nb-btn nb-btn-small bg-surface w-fit">
          ← Roadmap
        </Link>
        {due.length === 0 ? (
          <div className="nb-card nb-p-8 nb-stack text-center">
            <h1 className="nb-title">Nothing due</h1>
            <p className="nb-subtitle">
              You have {stats.scheduled} card{stats.scheduled === 1 ? "" : "s"} scheduled.
              Miss questions in pillar quizzes and they&apos;ll show up here on a spaced
              schedule: tomorrow, then 2, 4, 8, then 16 days.
            </p>
            <Link href="/" className="nb-btn nb-btn-primary w-fit mx-auto">
              Take a quiz
            </Link>
          </div>
        ) : (
          <>
            <header className="nb-stack">
              <h1 className="nb-title">Review</h1>
              <p className="nb-subtitle">
                {stats.due} card{stats.due === 1 ? "" : "s"} due. Answer honestly: wrong
                answers come back sooner.
              </p>
            </header>
            <ReviewRunner questions={due} />
          </>
        )}
      </div>
    </main>
  );
}
