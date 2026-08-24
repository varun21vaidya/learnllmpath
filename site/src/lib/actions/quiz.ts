"use server";

import { requireUserId } from "@/lib/auth";
import { recordQuizAttempt, hasPassedQuiz, seedSrsFromQuiz } from "@/lib/db";
import { QUIZZES } from "@/data/quizzes";

const PASS_THRESHOLD = 70;

export interface AnswerResult {
  ok: boolean;
  correct?: boolean;
  explanation?: string;
}

function findQuestion(questionId: string) {
  for (const quiz of QUIZZES) {
    const q = quiz.questions.find((x) => x.id === questionId);
    if (q) return q;
  }
  return null;
}

export async function gradeAnswer(questionId: string, optionIndex: number): Promise<AnswerResult> {
  try {
    await requireUserId();
  } catch {
    return { ok: false };
  }
  const q = findQuestion(questionId);
  if (!q || !Number.isInteger(optionIndex)) return { ok: false };
  return {
    ok: true,
    correct: optionIndex === q.answerIndex,
    explanation: q.explanation,
  };
}

export interface FinishResult {
  ok: boolean;
  scorePct?: number;
  passed?: boolean;
  bestSoFar?: number;
}

export async function finishQuiz(
  pillarN: number,
  answers: Record<string, number>
): Promise<FinishResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false };
  }
  const quiz = QUIZZES.find((x) => x.pillarN === pillarN);
  if (!quiz) return { ok: false };

  let correctCount = 0;
  let answered = 0;
  for (const q of quiz.questions) {
    const chosen = answers[q.id];
    if (typeof chosen !== "number") continue;
    answered++;
    if (chosen === q.answerIndex) correctCount++;
  }
  if (answered < quiz.questions.length) return { ok: false };

  const scorePct = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePct >= PASS_THRESHOLD;
  await recordQuizAttempt(userId, pillarN, scorePct, passed);

  // Feed spaced repetition: every missed question becomes/resets a review card.
  const wrongIds = quiz.questions
    .filter((q) => answers[q.id] !== q.answerIndex)
    .map((q) => q.id);
  try {
    await seedSrsFromQuiz(userId, wrongIds);
  } catch {
    // SRS is best-effort; never block quiz completion
  }

  const prevPassed = pillarN > 1 ? await hasPassedQuiz(userId, pillarN - 1) : true;
  return { ok: true, scorePct, passed: passed && prevPassed !== undefined ? passed : passed };
}

export async function getGateStatus(): Promise<{ locked: boolean }> {
  return { locked: false };
}
