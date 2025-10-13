"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AuthPage() {
  // separate state per form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // separate pending flags
  const [pendingLogin, setPendingLogin] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setPendingLogin(true);
    try {
      const r = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Login failed");
      window.location.assign(j.redirect || "/app/qa");
    } catch (err: any) {
      setMsg(err.message || "Login failed");
    } finally {
      setPendingLogin(false);
    }
  }

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setPendingSignup(true);
    try {
      const r = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Signup failed");
      setMsg(
        j.needsEmailConfirm
          ? "Check your email to confirm your account."
          : "Signed up! Redirecting…"
      );
      if (!j.needsEmailConfirm) window.location.assign("/app/qa");
    } catch (err: any) {
      setMsg(err.message || "Signup failed");
    } finally {
      setPendingSignup(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>

      {/* LOGIN */}
      <form className="space-y-3" onSubmit={doLogin} autoComplete="on" aria-busy={pendingLogin}>
        <h2 className="font-medium">Sign in with email</h2>
        <input
          id="login-email"
          name="login-email"
          type="email"
          inputMode="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          id="login-password"
          name="login-password"
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={pendingLogin}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
          aria-disabled={pendingLogin}
        >
          {pendingLogin ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500">or</div>

      {/* SIGNUP */}
      <form className="space-y-3" onSubmit={doSignup} autoComplete="on" aria-busy={pendingSignup}>
        <h2 className="font-medium">Create an account</h2>
        <input
          id="signup-email"
          name="signup-email"
          type="email"
          inputMode="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          id="signup-password"
          name="signup-password"
          type="password"
          placeholder="Create a password"
          className="w-full border rounded px-3 py-2"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
        />
        <button
          type="submit"
          disabled={pendingSignup}
          className="w-full rounded bg-slate-900 text-white py-2 disabled:opacity-60"
          aria-disabled={pendingSignup}
        >
          {pendingSignup ? "Creating account…" : "Create account"}
        </button>
      </form>

      <button
        onClick={signInGoogle}
        className="w-full rounded border py-2"
        aria-label="Continue with Google"
        type="button"
      >
        Continue with Google
      </button>

      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
