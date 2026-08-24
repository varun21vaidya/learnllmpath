import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPublicProfileByHandle, getPublicUserStats } from "@/lib/db";
import { ROADMAP } from "@/data/roadmap";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ handle: string }> }) {
  const { handle } = await ctx.params;

  let profile = null;
  try {
    profile = await getPublicProfileByHandle(handle);
  } catch {
    return new NextResponse("database unavailable", { status: 503 });
  }
  if (!profile) return new NextResponse("not found", { status: 404 });

  const statsData = await getPublicUserStats(profile.id);
  const totalItems = ROADMAP.pillars.reduce(
    (n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0),
    0
  );
  const pct = Math.round((statsData.done_count / totalItems) * 100);

  const displayName = profile.name || profile.handle || "Learner";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdc800",
          padding: 48,
          border: "12px solid #1c293c",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              background: "#1c293c",
              color: "#fdc800",
              fontSize: 34,
              fontWeight: 900,
              padding: "10px 24px",
            }}
          >
            Learn LLM Path
          </div>
          <div style={{ fontSize: 30, color: "#1c293c" }}>learnllmpath.com</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: "#1c293c" }}>{displayName}</div>
          {profile.handle && (
            <div style={{ fontSize: 36, color: "#44536a", fontFamily: "monospace" }}>
              @{profile.handle}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <Card label="complete" value={`${pct}%`} bg="#a6faff" />
          <Card label="resources done" value={`${statsData.done_count}/${totalItems}`} bg="#ff6b9d" />
          <Card label="pillars passed" value={`${statsData.pillars_passed}/10`} bg="#c5a3ff" />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function Card({ label, value, bg }: { label: string; value: string; bg: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: bg,
        border: "6px solid #1c293c",
        boxShadow: "10px 10px 0 #1c293c",
        padding: "20px 36px",
        gap: 6,
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 900, color: "#1c293c" }}>{value}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1c293c", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}
