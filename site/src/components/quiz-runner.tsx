"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { gradeAnswer, finishQuiz } from "@/lib/actions/quiz";

interface SafeQuestion {
  id: string;
  prompt: string;
  options: string[];
}

const LETTERS = ["A", "B", "C", "D"];

export function QuizRunner({
  pillarN,
  questions,
  alreadyPassed,
}: {
  pillarN: number;
  questions: SafeQuestion[];
  alreadyPassed: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<{ pct: number; passed: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const q = questions[index];
  const total = questions.length;

  function selectOption(optIdx: number) {
    if (feedback) return;
    setChosen(optIdx);
    startTransition(async () => {
      const res = await gradeAnswer(q.id, optIdx);
      if (!res.ok) {
        setError(true);
        return;
      }
      setFeedback({ correct: Boolean(res.correct), explanation: res.explanation ?? "" });
      setAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
    });
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setChosen(null);
      setFeedback(null);
      return;
    }
    startTransition(async () => {
      const res = await finishQuiz(pillarN, answers);
      if (!res.ok) {
        setError(true);
        return;
      }
      setScore({ pct: res.scorePct ?? 0, passed: Boolean(res.passed) });
    });
  }

  if (error) {
    return (
      <div className="nb-card nb-p-8 nb-stack text-center">
        <p className="nb-error">Something went wrong grading your answer. Reload and try again.</p>
        <Link href="/" className="nb-btn nb-btn-primary w-fit mx-auto">
          Back to roadmap
        </Link>
      </div>
    );
  }

  if (score) {
    return (
      <div className="nb-card nb-p-8 nb-stack-lg text-center">
        <h1 className="nb-title">
          {score.pct}%{" "}
          {score.passed ? (
            <span className="text-success">Passed!</span>
          ) : (
            <span className="text-danger">Below 70%</span>
          )}
        </h1>
        <p className="nb-subtitle">
          {score.passed
            ? pillarN < 10
              ? `Pillar ${pillarN + 1} is now unlocked for tracking.`
              : "You finished the final pillar quiz."
            : `You need ≥70% to unlock Pillar ${pillarN + 1}. Retake anytime; only your best score counts.`}
        </p>
        {alreadyPassed && score.passed && (
          <p className="text-xs font-mono">Best-score tracking keeps your highest attempt.</p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          {!score.passed && (
            <button
              type="button"
              className="nb-btn nb-btn-primary"
              onClick={() => {
                setScore(null);
                setIndex(0);
                setChosen(null);
                setFeedback(null);
                setAnswers({});
              }}
            >
              Retake quiz
            </button>
          )}
          <Link href="/" className="nb-btn bg-accent-cyan text-on-accent">
            Back to roadmap
          </Link>
          <Link href="/dashboard" className="nb-btn bg-surface">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nb-card nb-p-6 nb-stack">
      <div className="flex items-center justify-between font-mono text-xs">
        <span>
          Question {index + 1}/{total}
        </span>
        <span>Pillar {pillarN} quiz</span>
      </div>

      <div className="nb-progress-track">
        <div
          className="nb-progress-fill"
          style={{ width: `${((index + (feedback ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <h2 className="font-bold text-base sm:text-lg leading-snug">{q.prompt}</h2>

      <div className="nb-stack" role="group" aria-label="Answer options">
        {q.options.map((opt, i) => {
          const isChosen = chosen === i;
          const state = !feedback
            ? ""
            : isChosen && feedback.correct
              ? "bg-accent-green! text-white!"
              : isChosen
                ? "bg-accent-red! text-white!"
                : "";
          return (
            <button
              key={i}
              type="button"
              disabled={pending || Boolean(feedback)}
              onClick={() => selectOption(i)}
              className={`nb-btn justify-start! text-left font-semibold! bg-surface w-full ${state}`}
            >
              <span className="nb-badge bg-primary text-on-accent mr-2">{LETTERS[i]}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`p-3 border-3 border-ink font-medium text-sm ${
            feedback.correct ? "bg-ok-bg" : "bg-bad-bg"
          }`}
          role="status"
        >
          <strong>{feedback.correct ? "Correct. " : "Not quite. "}</strong>
          {feedback.explanation}
        </div>
      )}

      {feedback && (
        <button type="button" onClick={next} disabled={pending} className="nb-btn nb-btn-primary w-fit">
          {index + 1 < total ? "Next question →" : "Finish quiz"}
        </button>
      )}
    </div>
  );
}
