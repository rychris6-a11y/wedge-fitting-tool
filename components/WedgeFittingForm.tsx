// components/WedgeFittingForm.tsx
// Same design principle as the tow tool's TrailerWeightInput: never
// ask for "bounce" by name. Ask about symptoms (miss pattern, turf)
// that a golfer can actually answer, and translate to the real spec
// on the backend.

"use client";

import { useState } from "react";

interface WedgeFittingFormProps {
  onSubmit: (values: { pwLoft: number; missPattern: string; turfCondition: string }) => void;
}

const MISS_PATTERNS = ["Chunk it (fat)", "Hit it thin", "Pretty solid"];
const TURF_CONDITIONS = ["Soft/wet turf", "Firm/dry turf", "Lots of sand"];

// Modern pitching wedges commonly run 44-48°; used as the fallback
// when someone doesn't know their exact loft.
const DEFAULT_PW_LOFT = 46;

export default function WedgeFittingForm({ onSubmit }: WedgeFittingFormProps) {
  const [pwLoftInput, setPwLoftInput] = useState("");
  const [showLoftHelp, setShowLoftHelp] = useState(false);
  const [missPattern, setMissPattern] = useState("");
  const [turfCondition, setTurfCondition] = useState("");

  const canSubmit = missPattern !== "" && turfCondition !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    const pwLoft = pwLoftInput ? Number(pwLoftInput) : DEFAULT_PW_LOFT;
    onSubmit({ pwLoft, missPattern, turfCondition });
  }

  return (
    <div className="wedge-form">
      <label className="trailer-input-label" htmlFor="pw-loft">
        What's your pitching wedge's loft?
      </label>
      <div className="trailer-input-row">
        <input
          id="pw-loft"
          type="number"
          inputMode="numeric"
          placeholder={String(DEFAULT_PW_LOFT)}
          value={pwLoftInput}
          onChange={(e) => setPwLoftInput(e.target.value)}
        />
        <span className="trailer-input-unit">degrees</span>
      </div>
      <button
        type="button"
        className="trailer-input-help-link"
        onClick={() => setShowLoftHelp(!showLoftHelp)}
      >
        Don't know it?
      </button>
      {showLoftHelp && (
        <div className="trailer-input-help">
          <p>
            Look for a small number stamped on the back of the club head near
            the shaft, or check your iron set's spec sheet if you still have
            it. If you can't find it, leave this blank — we'll assume a
            typical modern pitching wedge (46°), which is right for most
            golfers with a newer iron set.
          </p>
        </div>
      )}

      <label className="trailer-input-label" htmlFor="miss-pattern">
        When you miss a chip or pitch, what usually happens?
      </label>
      <select id="miss-pattern" value={missPattern} onChange={(e) => setMissPattern(e.target.value)}>
        <option value="">Select one</option>
        {MISS_PATTERNS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <label className="trailer-input-label" htmlFor="turf-condition">
        What do the courses you usually play look like?
      </label>
      <select id="turf-condition" value={turfCondition} onChange={(e) => setTurfCondition(e.target.value)}>
        <option value="">Select one</option>
        {TURF_CONDITIONS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <button
        type="button"
        className="trailer-input-submit"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Find my wedges
      </button>
    </div>
  );
}
