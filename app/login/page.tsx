"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push(data.user.role === "admin" ? "/admin" : "/user");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)" }}>
      <div className="w-full max-w-sm animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #007AFF, #5856D6)" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="22" r="5" fill="white" fillOpacity="0.9"/>
              <path d="M22 22l1.5 1.5 2.5-2.5" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "#1d1d1f" }}>WorkTrack</h1>
          <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-lg" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1d1d1f" }}>Email</label>
              <input
                type="email"
                className="apple-input"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1d1d1f" }}>Password</label>
              <input
                type="password"
                className="apple-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-center py-2.5 px-4 rounded-xl"
                style={{ background: "rgba(255, 59, 48, 0.1)", color: "#FF3B30" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="apple-btn w-full text-white mt-2"
              style={{ background: loading ? "#5AC8FA" : "#007AFF", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <p className="text-xs text-center mb-3" style={{ color: "#8E8E93" }}>Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setEmail("admin@company.com"); setPassword("Admin@123"); }}
                className="text-xs py-2 px-3 rounded-lg text-center transition-all"
                style={{ background: "rgba(0,122,255,0.08)", color: "#007AFF" }}>
                <span className="font-medium block">Admin</span>
                admin@company.com
              </button>
              <button onClick={() => { setEmail("john@company.com"); setPassword("User@123"); }}
                className="text-xs py-2 px-3 rounded-lg text-center transition-all"
                style={{ background: "rgba(52,199,89,0.08)", color: "#34C759" }}>
                <span className="font-medium block">Employee</span>
                john@company.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
