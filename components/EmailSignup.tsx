// components/EmailSignup.tsx
// Genuine opt-in signup, not a cold list. Placed on the results
// screen deliberately -- right after someone's gotten real value
// from the tool is when they're most receptive, not before.

"use client";

import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setStatus("done");
      setMessage(data.message ?? "Check your inbox to confirm.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="email-signup email-signup-done">
        <p>✓ {message}</p>
      </div>
    );
  }

  return (
    <div className="email-signup">
      <p className="email-signup-title">Want a heads-up when we add new wedges?</p>
      <form onSubmit={handleSubmit} className="email-signup-form">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Notify me"}
        </button>
      </form>
      {status === "error" && <p className="email-signup-error">{message}</p>}
      <p className="email-signup-note">No spam, unsubscribe anytime.</p>
    </div>
  );
}
