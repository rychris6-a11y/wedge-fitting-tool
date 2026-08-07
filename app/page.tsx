// app/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Created once on mount so it's ready to play instantly on submit,
    // rather than constructing a new Audio object on every click.
    audioElRef.current = new Audio("/sounds/putt-in-hole.mp3");
    audioElRef.current.preload = "auto";
  }, []);

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

    // Play synchronously, before any await — browsers tie audio
    // playback permission to a direct user gesture, and an await
    // here risks breaking that chain in stricter browsers. Reduced
    // motion means reduced everything, so skip the sound too.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion && audioElRef.current) {
      audioElRef.current.currentTime = 0;
      audioElRef.current.play().catch(() => {
        // Autoplay can still be blocked in some browsers/settings —
        // the animation plays silently rather than failing outright.
      });
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
      <h1 className="tool-title">Find your wedge setup</h1>
      <p className="tool-subtitle">Answer a few questions, no fitting jargon required.</p>

      <p className="trust-strip">
        <span className="trust-strip-icon" aria-hidden="true">✓</span>
        Built on the same bounce and gapping principles Titleist's Bob Vokey
        and Golf Digest teach.{" "}
        <Link href="/guide#sources">See our sources</Link>
      </p>

      {error && <p className="tool-error">{error}</p>}

      {step === "form" && <WedgeFittingForm onSubmit={handleSubmit} />}

      {step === "celebrating" && (
        <ChipInAnimation onComplete={handleAnimationComplete} />
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
