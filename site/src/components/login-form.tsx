"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser, type RegisterState } from "@/lib/actions/register";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="nb-btn nb-btn-primary w-full" disabled={pending}>
      {pending ? "Working…" : label}
    </button>
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction] = useActionState<RegisterState, FormData>(registerUser, {});
  const router = useRouter();
  const [signinError, setSigninError] = useState<string | null>(null);

  async function handleSignIn(formData: FormData) {
    setSigninError(null);
    const res = await signIn("credentials", {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      redirect: false,
    });
    if (res?.error) {
      setSigninError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="nb-stack-lg w-full max-w-sm">
      {googleEnabled && (
        <form
          action={async () => {
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="nb-btn nb-btn-accent w-full">
            Continue with Google
          </button>
        </form>
      )}

      <div className="nb-divider">or</div>

      <form action={handleSignIn} className="nb-stack">
        <label className="nb-label" htmlFor="signin-email">
          Email
        </label>
        <input id="signin-email" name="email" type="email" required className="nb-input" />
        <label className="nb-label" htmlFor="signin-password">
          Password
        </label>
        <input id="signin-password" name="password" type="password" required minLength={8} className="nb-input" />
        <SubmitButton label="Sign in" />
        {signinError && (
          <p role="alert" className="nb-error">
            {signinError}
          </p>
        )}
      </form>

      <div className="nb-divider">new here?</div>

      <form action={formAction} className="nb-stack">
        <input name="name" placeholder="Display name" className="nb-input" maxLength={60} />
        <input name="email" type="email" required placeholder="Email" className="nb-input" />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 chars)"
          className="nb-input"
        />
        <SubmitButton label="Create account" />
        {state.error && (
          <p role="alert" className="nb-error">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="nb-btn nb-btn-small">
        Log out
      </button>
    </form>
  );
}
