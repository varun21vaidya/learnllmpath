import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSrsQuestions } from "@/lib/db";
import { QUIZZES } from "@/data/quizzes";

export const dynamic = "force-dynamic";

function tsvEscape(text: string): string {
  return text.replace(/\t/g, " ").replace(/\n/g, "<br>");
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let questionIds: string[] = [];
  try {
    questionIds = await getAllSrsQuestions(session.user.id);
  } catch {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
  if (questionIds.length === 0) {
    return NextResponse.json(
      { error: "no_cards", message: "Take a quiz first; missed questions become cards." },
      { status: 404 }
    );
  }
  const wanted = new Set(questionIds);

  const rows: string[] = ["#separator:tab", "#html:true", "#tags column:3"];
  for (const quiz of QUIZZES) {
    for (const q of quiz.questions) {
      if (!wanted.has(q.id)) continue;
      const back = `${q.options[q.answerIndex]}<br><br>${q.explanation}`;
      rows.push([tsvEscape(q.prompt), tsvEscape(back), `pillar-${quiz.pillarN} learn-llm-path`].join("\t"));
    }
  }

  return new NextResponse(rows.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Content-Disposition": 'attachment; filename="learn-llm-path-anki.txt"',
      "Cache-Control": "no-store",
    },
  });
}
