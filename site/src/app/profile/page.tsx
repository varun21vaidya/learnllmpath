import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfile, getPublicUserStats } from "@/lib/db";
import { computeStats } from "@/lib/home-data";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learn LLM Path: Your Profile",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  let profile = null;
  try {
    profile = await getProfile(userId);
  } catch {}

  if (!profile) {
    return (
      <main className="nb-page nb-stack pt-6">
        <h1 className="nb-title">Profile</h1>
        <div className="nb-callout font-bold">
          Database not configured. Set DATABASE_URL to manage your public profile.
        </div>
      </main>
    );
  }

  const completedIds = await getProgressSafe(userId);
  const statsData = await getPublicUserStats(userId);
  const stats = computeStats(completedIds);

  return (
    <main className="nb-page nb-stack-lg pt-6">
      <header className="nb-stack">
        <h1 className="nb-title">Your profile</h1>
        <p className="nb-subtitle">
          Claim a handle to share progress and appear on the leaderboard.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label="complete" value={`${stats.overallPct}%`} />
        <Stat label="resources done" value={`${stats.doneItems}/${stats.totalItems}`} />
        <Stat label="pillars passed" value={`${statsData.pillars_passed}/10`} />
        <Stat label="cohort" value={statsData.joined_month} />
      </section>

      <section className="nb-card nb-p-5">
        <ProfileForm initialHandle={profile.handle ?? ""} initialPublic={profile.is_public} />
      </section>

      {profile.handle && profile.is_public && (
        <section className="nb-card nb-p-5 nb-stack">
          <h2 className="font-black text-lg">Share</h2>
          <p className="text-sm">
            Public profile:{" "}
            <Link href={`/u/${profile.handle}`} className="underline font-bold">
              /u/{profile.handle}
            </Link>
          </p>
          <p className="text-sm break-all font-mono text-xs">
            Social card: https://learnllmpath.com/api/card/{profile.handle}
          </p>
        </section>
      )}
    </main>
  );
}

async function getProgressSafe(userId: string): Promise<Set<string>> {
  try {
    const { getProgress } = await import("@/lib/db");
    return await getProgress(userId);
  } catch {
    return new Set();
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-card nb-p-4 text-center">
      <p className="font-black text-2xl">{value}</p>
      <p className="text-[10px] font-mono uppercase">{label}</p>
    </div>
  );
}
