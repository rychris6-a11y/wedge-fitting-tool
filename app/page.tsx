// app/page.tsx

"use client";

import { useState, useRef } from "react";
import WedgeFittingForm from "@/components/WedgeFittingForm";
import WedgeFittingResult from "@/components/WedgeFittingResult";
import ChipInAnimation from "@/components/ChipInAnimation";

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

type Step = "form" | "celebrating" | "result";

export default function WedgeFittingTool() {
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FittingData | null>(null);

  // Fetch result and animation completion are two independent async
  // events — the results screen should only appear once BOTH are
  // done, so a fast API response doesn't cut the animation short,
  // and a slow one doesn't leave the animation frozen with nothing
  // to show afterward.
  const fetchDoneRef = useRef(false);
  const animationDoneRef = useRef(false);
  const pendingDataRef = useRef<FittingData | null>(null);
  const pendingErrorRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  function maybeAdvanceToResult() {
    if (fetchDoneRef.current && animationDoneRef.current) {
      if (pendingErrorRef.current) {
        setError(pendingErrorRef.current);
        setStep("form");
      } else {
        setResult(pendingDataRef.current);
        setStep("result");
      }
    }
  }

  async function handleSubmit(values: { pwLoft: number; missPattern: string; turfCondition: string }) {
    setError(null);
    fetchDoneRef.current = false;
    animationDoneRef.current = false;
    pendingDataRef.current = null;
    pendingErrorRef.current = null;

    // Create the AudioContext synchronously, inside the click's own
    // call chain, before any await — browsers require audio playback
    // to trace back to a real user gesture, and an await here would
    // risk breaking that chain in stricter browsers.
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new Ctx();
    } catch {
      audioContextRef.current = null; // animation still plays silently if audio isn't available
    }

    setStep("celebrating");

    try {
      const res = await fetch("/api/wedge-fitting-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        pendingErrorRef.current = data.error ?? "Something went wrong. Try again.";
      } else {
        pendingDataRef.current = data;
      }
    } catch {
      pendingErrorRef.current = "Something went wrong. Check your connection and try again.";
    } finally {
      fetchDoneRef.current = true;
      maybeAdvanceToResult();
    }
  }

  function handleAnimationComplete() {
    animationDoneRef.current = true;
    maybeAdvanceToResult();
  }

  function handleStartOver() {
    setResult(null);
    setError(null);
    setStep("form");
  }

  return (
    <main className="tool-page">
      <p className="tool-eyebrow">⛳ Wedge Yardage</p>
      <h1 className="tool-title">Find your wedge setup</h1>
      <p className="tool-subtitle">Answer a few questions, no fitting jargon required.</p>

      {error && <p className="tool-error">{error}</p>}

      {step === "form" && <WedgeFittingForm onSubmit={handleSubmit} />}

      {step === "celebrating" && (
        <ChipInAnimation audioContext={audioContextRef.current} onComplete={handleAnimationComplete} />
      )}

      {step === "result" && result && (
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
