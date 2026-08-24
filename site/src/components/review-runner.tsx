"use client";

import { useState, useTransition } from "react";
import { gradeAnswer } from "@/lib/actions/quiz";
import { recordReview, type SafeQuestion } from "@/lib/actions/srs";

const LETTERS = ["A", "B", "C", "D"];

export function ReviewRunner({ questions }: { questions: SafeQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [stats, setStats] = useState({ right: 0, wrong: 0 });
  const [pending, startTransition] = useTransition();

  const q = questions[index];

  function choose(optIdx: number) {
    if (feedback || !q) return;
    setChosen(optIdx);
    startTransition(async () => {
      const res = await gradeAnswer(q.id, optIdx);
      const correct = Boolean(res.ok && res.correct);
      setFeedback({ correct, explanation: res.explanation ?? "" });
      setStats((s) => (correct ? { ...s, right: s.right + 1 } : { ...s, wrong: s.wrong + 1 }));
      await recordReview(q.id, correct);
    });
  }

  function next() {
    setIndex((i) => i + 1);
    setChosen(null);
    setFeedback(null);
  }

  if (!q) return null;

  return (
    <div className="nb-card nb-p-6 nb-stack">
      <div className="flex items-center justify-between font-mono text-xs">
        <span>
          Card {index + 1}/{questions.length}
        </span>
        <span>
          ✓ {stats.right} · ✗ {stats.wrong}
        </span>
      </div>

      <div className="nb-progress-track">
        <div
          className="nb-progress-fill"
          style={{ width: `${((index + (feedback ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="font-bold text-base sm:text-lg leading-snug">{q.prompt}</h2>

      <div className="nb-stack" role="group" aria-label="Answer options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={pending || Boolean(feedback)}
            onClick={() => choose(i)}
            className={`nb-btn justify-start! text-left font-semibold! bg-surface w-full ${
              feedback
                ? chosen === i
                  ? feedback.correct
                    ? "bg-accent-green! text-white!"
                    : "bg-accent-red! text-white!"
                  : ""
                : ""
            }`}
          >
            <span className="nb-badge bg-primary text-on-accent mr-2">{LETTERS[i]}</span>
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <>
          <div
            className={`p-3 border-3 border-ink font-medium text-sm ${
              feedback.correct ? "bg-ok-bg" : "bg-bad-bg"
            }`}
            role="status"
          >
            <strong>{feedback.correct ? "Correct. " : "Not quite. "}</strong>
            {feedback.explanation}
          </div>
          <button type="button" onClick={next} disabled={pending} className="nb-btn nb-btn-primary w-fit">
            {index + 1 < questions.length ? "Next card →" : "Finish"}
          </button>
        </>
      )}
    </div>
  );
}
