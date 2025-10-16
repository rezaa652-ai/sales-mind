"use client";

export default function AppError({ error, reset }: { error: unknown; reset: () => void }) {
  console.error("[/app] error boundary:", error);
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600 text-sm">
        Please try again. If it keeps happening, sign out and back in.
      </p>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => reset()}
        >
          Try again
        </button>
        <a className="px-4 py-2 rounded border" href="/auth/signout">
          Sign out
        </a>
      </div>
    </div>
  );
}
