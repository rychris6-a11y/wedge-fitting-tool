// components/ChipInAnimation.tsx
// Ported from the Claude Design system export. Improvements over the
// previous version: a real golfer figure (legs, torso, cap) instead
// of a floating club, and a multi-bounce ball path (several Q-curve
// segments) instead of one smooth arc into a rattle -- closer to how
// a chip shot actually behaves on landing. Still built around the
// real 2592ms duration measured from putt-in-hole.mp3, so audio and
// motion stay in sync.

"use client";

import { useEffect, useRef } from "react";

interface ChipInAnimationProps {
  onComplete: () => void;
  playing?: boolean;
}

const CLIP_DURATION_MS = 2592;
const REDUCED_MOTION_DURATION_MS = 500;

export default function ChipInAnimation({ onComplete, playing = true }: ChipInAnimationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? REDUCED_MOTION_DURATION_MS : CLIP_DURATION_MS;
    timerRef.current = setTimeout(onComplete, duration + 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, onComplete]);

  return (
    <div className="chipin-stage" aria-hidden="true">
      <svg viewBox="0 0 400 160" className="chipin-svg">
        <ellipse cx="200" cy="130" rx="200" ry="30" fill="var(--fairway-light)" />
        <ellipse cx="340" cy="98" rx="34" ry="10" fill="#163025" />
        <ellipse cx="340" cy="98" rx="9" ry="4" fill="#0D1B14" />
        <line x1="340" y1="60" x2="340" y2="98" stroke="var(--chalk)" strokeWidth="2" />
        <polygon points="340,60 340,72 358,66" fill="var(--flag)" className="chipin-flag" />

        <ellipse className="chipin-shadow" cx="0" cy="0" rx="6" ry="2.5" fill="#0D1B14" />

        {/* Golfer figure -- new addition */}
        <g stroke="var(--ink)" strokeLinecap="round" fill="none">
          <line x1="14" y1="120" x2="20" y2="104" strokeWidth="3.5" />
          <line x1="28" y1="120" x2="22" y2="104" strokeWidth="3.5" />
        </g>
        <path d="M 18.5 83 Q 24 76 29.5 83 L 27 106 L 21 106 Z" fill="var(--flag)" />
        <circle cx="18.5" cy="83" r="3" fill="var(--flag)" />
        <circle cx="29.5" cy="83" r="3" fill="var(--flag)" />
        <path d="M 22 80 L 24 84.5 L 26 80 Z" fill="var(--paper)" opacity="0.85" />
        <circle cx="25" cy="70" r="6.5" fill="var(--ink)" />
        <path d="M 18 68 Q 25 59 32 68 Q 25 65 18 68 Z" fill="var(--chalk)" />
        <path d="M 30 67.5 Q 37 67 37.5 69.5 Q 31 70.5 29 69 Z" fill="var(--chalk)" />

        <g className="chipin-club">
          <line x1="24" y1="78" x2="30.4" y2="90" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="30.4" y1="90" x2="40" y2="108" stroke="#B9C8BE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 37.3 109.4 L 42 116.5 L 47.5 116 L 40.5 104.8 Z" fill="var(--sand)" />
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
