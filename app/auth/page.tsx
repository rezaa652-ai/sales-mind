
"use client";

import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let endpoint = "";
      if (mode === "login") endpoint = "/api/auth/login";
      if (mode === "signup") endpoint = "/api/auth/signup";
      if (mode === "reset") endpoint = "/api/auth/reset";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.error) {
        setError(data.error);
      } else if (mode === "signup" && data.success) {
        setMessage("Signed up successfully. You can now log in.");
        setMode("login");
      } else if (mode === "reset" && data.success) {
        setMessage("Password reset link sent to your email.");
        setMode("login");
      }
    } catch (err: any) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-[360px] bg-white rounded-2xl shadow-lg p-8 space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center text-black">
          {mode === "login"
            ? "Welcome back"
            : mode === "signup"
            ? "Create account"
            : "Reset password"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        {mode !== "reset" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && (
          <p className="text-sm text-blue-600 text-center font-medium">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Log In"
            : mode === "signup"
            ? "Sign Up"
            : "Send Reset Link"}
        </button>

        <div className="text-sm text-center text-gray-600 space-y-2">
          {mode === "login" && (
            <>
              <p>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>

              {/* 🔹 Simplified forgot password link */}
              <p>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Forgot Password
                </button>
              </p>
            </>
          )}

          {mode !== "login" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-blue-600 hover:underline"
            >
              Back to login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
