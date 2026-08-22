import Link from "next/link";
import { LoginForm, SignOutButton } from "@/components/login-form";
import { auth, googleEnabled } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  return (
    <main className="nb-page nb-center">
      <div className="nb-card nb-p-8 w-full max-w-md nb-stack-lg">
        <h1 className="nb-title">skilllog</h1>
        {session?.user ? (
          <div className="nb-stack text-center">
            <p>
              Signed in as <strong>{session.user.email}</strong>
            </p>
            <Link href="/dashboard" className="nb-btn nb-btn-primary">
              Go to dashboard
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <>
            <p className="nb-subtitle text-center">
              Sign in to track progress, keep notes, and take quizzes.
            </p>
            <LoginForm googleEnabled={googleEnabled} />
          </>
        )}
      </div>
    </main>
  );
}
