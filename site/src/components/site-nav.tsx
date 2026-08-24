import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteNav() {
  const session = await auth();

  return (
    <nav className="border-b border-ink bg-ink text-paper">
      <div className="nb-page flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
        <Link
          href="/"
          className="mr-auto whitespace-nowrap font-serif text-lg font-black tracking-tight text-paper"
        >
          Learn LLM Path
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="nb-btn nb-btn-small bg-paper text-ink">
            Roadmap
          </Link>
          <Link href="/plan" className="nb-btn nb-btn-small bg-paper text-ink">
            Plan
          </Link>
          <Link href="/review" className="nb-btn nb-btn-small bg-paper text-ink hidden sm:inline-flex">
            Review
          </Link>
          <Link href="/leaderboard" className="nb-btn nb-btn-small bg-paper text-ink hidden md:inline-flex">
            Leaderboard
          </Link>
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link href="/dashboard" className="nb-btn nb-btn-small bg-surface text-ink">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="nb-btn nb-btn-small bg-primary text-on-accent">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
