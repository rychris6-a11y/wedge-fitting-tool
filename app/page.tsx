// app/page.tsx

"use client";

import { useState } from "react";
import WedgeFittingForm from "@/components/WedgeFittingForm";
import WedgeFittingResult from "@/components/WedgeFittingResult";

interface FittingData {
  recommendedLofts: { gapWedge: number; sandWedge: number; lobWedge: number };
  bounceRange: { low: number; high: number; reason: string };
  recommendedProducts: {
    id: string;
    brand: string;
    model: string;
    loftDeg: number;
    grind: string;
    bounceDeg: number;
    bestFor: string;
    priceUsdEst: number | null;
    productUrl: string | null;
  }[];
}

export default function WedgeFittingTool() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FittingData | null>(null);

  async function handleSubmit(values: { pwLoft: number; missPattern: string; turfCondition: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wedge-fitting-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleStartOver() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="tool-page">
      <p className="tool-eyebrow">⛳ Wedge Yardage</p>
      <h1 className="tool-title">Find your wedge setup</h1>
      <p className="tool-subtitle">Answer a few questions, no fitting jargon required.</p>

      {error && <p className="tool-error">{error}</p>}

      {!result && (
        <WedgeFittingForm onSubmit={handleSubmit} />
      )}

      {loading && <p className="tool-loading">Checking...</p>}

      {result && (
        <>
          <WedgeFittingResult
            recommendedLofts={result.recommendedLofts}
            bounceRange={result.bounceRange}
            recommendedProducts={result.recommendedProducts}
          />
          <button type="button" className="tool-start-over" onClick={handleStartOver}>
            Start over
          </button>
        </>
      )}
    </main>
  );
}
