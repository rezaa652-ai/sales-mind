// app/auth/page.tsx
"use client";
import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-3">
          {mode === "login" ? "Logga in" : "Skapa konto"}
        </h1>

        {mode === "login" ? (
          <form action="/auth/login" method="post" className="space-y-3">
            <label className="block text-sm">
              E-post
              <input
                name="email"
                type="email"
                required
                className="w-full border rounded p-2"
                autoComplete="email"
              />
            </label>
            <label className="block text-sm">
              Lösenord
              <input
                name="password"
                type="password"
                required
                className="w-full border rounded p-2"
                autoComplete="current-password"
              />
            </label>
            <button
              type="submit"
              className="w-full bg-[var(--brand)] text-white rounded p-2"
            >
              Logga in
            </button>
          </form>
        ) : (
          <form action="/auth/signup" method="post" className="space-y-3">
            <label className="block text-sm">
              E-post
              <input
                name="email"
                type="email"
                required
                className="w-full border rounded p-2"
                autoComplete="email"
              />
            </label>
            <label className="block text-sm">
              Lösenord
              <input
                name="password"
                type="password"
                required
                className="w-full border rounded p-2"
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            <button
              type="submit"
              className="w-full bg-[var(--brand)] text-white rounded p-2"
            >
              Skapa konto
            </button>
          </form>
        )}

        <button
          type="button"
          className="w-full mt-3 underline text-sm"
          onClick={() =>
            setMode(mode === "login" ? "signup" : "login")
          }
        >
          {mode === "login"
            ? "Skapa nytt konto"
            : "Har konto? Logga in"}
        </button>
      </div>
    </div>
  );
}
