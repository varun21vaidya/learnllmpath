import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/login-form";

export async function SiteNav() {
  const session = await auth();

  return (
    <nav className="border-b-3 border-ink bg-primary">
      <div className="nb-page !py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href="/" className="font-black text-lg tracking-tight mr-auto">
          skilllog
        </Link>
        <Link href="/" className="nb-btn nb-btn-small bg-white">
          Roadmap
        </Link>
        <Link href="/sequence" className="nb-btn nb-btn-small bg-white">
          Sequence
        </Link>
        <Link href="/portfolio" className="nb-btn nb-btn-small bg-white">
          Portfolio
        </Link>
        {session?.user ? (
          <>
            <Link href="/dashboard" className="nb-btn nb-btn-small bg-white">
              Dashboard
            </Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login" className="nb-btn nb-btn-small bg-accent-cyan border-ink">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
