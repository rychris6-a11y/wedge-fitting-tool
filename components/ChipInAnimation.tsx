// components/ChipInAnimation.tsx
// Rebuilt around the actual waveform timing of putt-in-hole.mp3:
// contact at 140ms, ball reaches the cup and starts rattling at
// 980ms, rattle settles ~1500ms, quiet by 1765ms, clip ends 2592ms.
// The visual timeline is keyed to those exact moments rather than a
// guessed duration, so sound and motion land together.
//
// Uses CSS offset-path for the flight arc (a real curve, not a few
// linear keyframe jumps) plus a ground shadow that grows and fades
// with height — the shadow is what makes an arc actually read as
// "in the air" rather than an object sliding across a flat plane.

"use client";

import { useEffect, useRef } from "react";

interface ChipInAnimationProps {
  onComplete: () => void;
}

const CLIP_DURATION_MS = 2592;
const REDUCED_MOTION_DURATION_MS = 500;

export default function ChipInAnimation({ onComplete }: ChipInAnimationProps) {
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotionRef.current ? REDUCED_MOTION_DURATION_MS : CLIP_DURATION_MS;
    const timer = setTimeout(onComplete, duration + 150);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="chipin-stage" aria-hidden="true">
      <svg viewBox="0 0 400 160" className="chipin-svg">
        <path
          id="chipin-flight-path"
          d="M 40 108 Q 150 15 255 92 L 300 96 L 328 97 L 338 97"
          fill="none"
          stroke="none"
        />

        <ellipse cx="200" cy="130" rx="200" ry="30" fill="var(--fairway-light)" />
        <ellipse cx="340" cy="98" rx="34" ry="10" fill="#163025" />
        <ellipse cx="340" cy="98" rx="9" ry="4" fill="#0D1B14" />
        <line x1="340" y1="60" x2="340" y2="98" stroke="var(--chalk)" strokeWidth="2" />
        <polygon points="340,60 340,72 358,66" fill="var(--flag)" className="chipin-flag" />

        <ellipse className="chipin-shadow" cx="0" cy="0" rx="6" ry="2.5" fill="#0D1B14" />

        <g className="chipin-club">
          <line x1="0" y1="0" x2="4" y2="34" stroke="#B9C8BE" strokeWidth="3" strokeLinecap="round" />
          <path d="M -2 30 L 14 34 L 12 42 L -4 40 Z" fill="var(--sand)" />
        </g>

        <g className="chipin-dust">
          <circle cx="0" cy="0" r="3" fill="var(--paper)" opacity="0.6" />
          <circle cx="7" cy="-2" r="2" fill="var(--paper)" opacity="0.5" />
          <circle cx="-6" cy="-1" r="2" fill="var(--paper)" opacity="0.5" />
          <circle cx="2" cy="3" r="1.5" fill="var(--paper)" opacity="0.4" />
        </g>

        <g className="chipin-ball-motion">
          <g className="chipin-ball-spin">
            <circle cx="0" cy="0" r="6" fill="var(--chalk)" stroke="#B9C8BE" strokeWidth="0.5" />
            <circle cx="2" cy="-1.5" r="1" fill="#D9D4C4" />
          </g>
        </g>

        <g className="chipin-sparkle">
          <circle cx="340" cy="98" r="14" fill="none" stroke="var(--sand)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
