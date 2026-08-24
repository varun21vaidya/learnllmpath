import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="nb-page nb-center">
      <div className="nb-card nb-p-8 nb-stack text-center max-w-md w-full">
        <h1 className="nb-title">🔍 Learner not found</h1>
        <p className="nb-subtitle">
          This profile doesn&apos;t exist, or the learner has set it to private.
          Private profiles don&apos;t get a public page.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/leaderboard" className="nb-btn nb-btn-primary">
            Leaderboard
          </Link>
          <Link href="/" className="nb-btn bg-surface">
            Roadmap
          </Link>
        </div>
        <p className="text-xs font-mono text-muted">
          Is this your handle? Check the &quot;show on leaderboard&quot; toggle in your profile.
        </p>
      </div>
    </main>
  );
}
