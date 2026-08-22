import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { QUIZZES } from "@/data/quizzes";
import { hasPassedQuiz } from "@/lib/db";
import { QuizRunner } from "@/components/quiz-runner";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  const pillarN = parseInt(pillar, 10);
  const quiz = QUIZZES.find((qz) => qz.pillarN === pillarN);
  if (!quiz) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  let alreadyPassed = false;
  try {
    if (pillarN > 1) alreadyPassed = await hasPassedQuiz(session.user.id, pillarN - 1);
    else alreadyPassed = true;
  } catch {
    // DB unavailable — render quiz without gate info
  }

  const safeQuestions = quiz.questions.map(({ id, prompt, options }) => ({ id, prompt, options }));

  return (
    <main className="nb-page nb-center">
      <div className="w-full max-w-2xl nb-stack-lg">
        <Link href="/" className="nb-btn nb-btn-small bg-white w-fit">
          ← Roadmap
        </Link>
        <QuizRunner pillarN={pillarN} questions={safeQuestions} alreadyPassed={alreadyPassed} />
      </div>
    </main>
  );
}
