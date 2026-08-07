// components/MowerBackground.tsx
// One mower per stripe "lane," each traveling the same diagonal
// heading (matching the stripe texture's angle) but staggered in
// both horizontal position and start time, so the fairway pattern
// cascades into existence lane by lane rather than one single wide
// wipe. The body starts as flat green; the striped texture only
// exists inside these reveal elements, so mowing ADDS the stripes,
// not removes them.
//
// Runs once, not on a loop -- continuous motion behind an
// interactive form is more distracting than charming. Once each
// lane finishes, its stripe band and mower are left in place
// permanently (the mower SVGs fade out; the revealed stripe stays).

"use client";

import { useEffect, useRef, useState } from "react";

const LANE_WIDTH_PX = 180; // matches the stripe texture's repeat period
const DURATION_MS = 3000; // how long each individual mower takes to cross
const STAGGER_MS = 90; // delay between each successive lane starting
const MARGIN = 60;
// Matches the 100deg angle used in the stripe texture (100 - 90 = 10deg from vertical)
const STRIPE_ANGLE_RAD = (10 * Math.PI) / 180;

interface Lane {
  maskEl: HTMLDivElement;
  mowerEl: SVGSVGElement;
  xCenter: number;
  laneLeft: number;
  laneRight: number;
  startDelay: number;
}

export default function MowerBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mowerRefs = useRef<(SVGSVGElement | null)[]>([]);
  // Starts at 0 so server and first client render match exactly
  // (no lanes, just the flat fairway body background) -- avoids a
  // Next.js hydration mismatch from reading window.innerWidth
  // during render. The real count is computed after mount instead.
  const [numLanes, setNumLanes] = useState(0);

  useEffect(() => {
    setNumLanes(Math.ceil(window.innerWidth / LANE_WIDTH_PX) + 1);
  }, []);

  const lanes = Array.from({ length: numLanes }, (_, i) => i);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || numLanes === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Skip straight to the fully-revealed state, no animation.
      laneRefs.current.forEach((el) => {
        if (el) el.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
      });
      mowerRefs.current.forEach((el) => el?.remove());
      return;
    }

    const H = window.innerHeight;
    const tanA = Math.tan(STRIPE_ANGLE_RAD);
    const yStart = -MARGIN;
    const yEnd = H + MARGIN;

    const laneData: Lane[] = lanes
      .map((i) => {
        const maskEl = laneRefs.current[i];
        const mowerEl = mowerRefs.current[i];
        if (!maskEl || !mowerEl) return null;
        const laneLeft = i * LANE_WIDTH_PX;
        const laneRight = laneLeft + LANE_WIDTH_PX;
        return {
          maskEl,
          mowerEl,
          xCenter: laneLeft + LANE_WIDTH_PX / 2,
          laneLeft,
          laneRight,
          startDelay: i * STAGGER_MS,
        };
      })
      .filter((l): l is Lane => l !== null);

    let startTime: number | null = null;
    let rafId: number;
    let doneCount = 0;

    function frame(now: number) {
      if (startTime === null) startTime = now;
      const elapsed = now - (startTime as number);

      laneData.forEach((lane) => {
        const localT = Math.min(Math.max((elapsed - lane.startDelay) / DURATION_MS, 0), 1);
        if (localT <= 0) return; // hasn't started yet

        const eased = localT < 0.5 ? 2 * localT * localT : 1 - Math.pow(-2 * localT + 2, 2) / 2;
        const cy = yStart + (yEnd - yStart) * eased;
        // drift the mower slightly along the stripe direction as it descends
        const cx = lane.xCenter - (yEnd - yStart) * tanA * eased * 0.5 + (yEnd - yStart) * tanA * 0.25;

        lane.mowerEl.style.left = `${cx}px`;
        lane.mowerEl.style.top = `${cy}px`;
        const angle = Math.atan2(-tanA * (yEnd - yStart), -(yEnd - yStart)) * (180 / Math.PI);
        lane.mowerEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        lane.mowerEl.style.opacity = localT >= 1 ? "0" : "1";

        // Reveal the stripe band within this lane, ABOVE the diagonal
        // mow line -- the line starts off-screen above the viewport
        // (negative %) and ends off-screen below it (>100%), so this
        // correctly grows from nothing revealed to fully revealed.
        const yAtLeft = ((cy + tanA * (lane.laneLeft - cx)) / H) * 100;
        const yAtRight = ((cy + tanA * (lane.laneRight - cx)) / H) * 100;
        lane.maskEl.style.clipPath = `polygon(0% 0%, 100% 0%, 100% ${yAtRight}%, 0% ${yAtLeft}%)`;

        if (localT >= 1 && !lane.mowerEl.dataset.done) {
          lane.mowerEl.dataset.done = "1";
          doneCount++;
        }
      });

      if (doneCount < laneData.length) {
        rafId = requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          mowerRefs.current.forEach((el) => el?.remove());
        }, 500);
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [numLanes]);

  return (
    <div ref={containerRef} className="mower-bg-container" aria-hidden="true">
      {lanes.map((i) => (
        <div
          key={i}
          ref={(el) => {
            laneRefs.current[i] = el;
          }}
          className="mower-bg-stripe-lane"
          style={{ left: i * LANE_WIDTH_PX, width: LANE_WIDTH_PX }}
        />
      ))}
      {lanes.map((i) => (
        <svg
          key={i}
          ref={(el) => {
            mowerRefs.current[i] = el;
          }}
          className="mower-bg-mower"
          viewBox="0 0 90 130"
        >
          <ellipse cx="45" cy="70" rx="42" ry="58" fill="#0D1B14" opacity="0.28" />
          <rect x="0" y="6" width="90" height="18" rx="4" fill="var(--ink)" />
          <rect x="6" y="10" width="78" height="4" fill="var(--ink-soft)" opacity="0.6" />
          <circle cx="18" cy="26" r="8" fill="var(--ink)" />
          <circle cx="18" cy="26" r="3" fill="var(--muted-2)" />
          <circle cx="72" cy="26" r="8" fill="var(--ink)" />
          <circle cx="72" cy="26" r="3" fill="var(--muted-2)" />
          <rect x="10" y="20" width="70" height="96" rx="12" fill="var(--sand)" />
          <rect x="10" y="20" width="16" height="96" rx="8" fill="rgba(0,0,0,0.08)" />
          <rect x="41" y="20" width="8" height="96" fill="var(--flag)" />
          <rect x="20" y="26" width="50" height="22" rx="6" fill="var(--ink-soft)" />
          <circle cx="45" cy="58" r="9" fill="var(--ink)" />
          <circle cx="45" cy="58" r="4" fill="var(--muted-2)" />
          <rect x="28" y="74" width="34" height="26" rx="8" fill="var(--ink)" />
          <ellipse cx="45" cy="90" rx="12" ry="9" fill="var(--flag)" />
          <line x1="39" y1="83" x2="39" y2="61" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <line x1="51" y1="83" x2="51" y2="61" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="75" r="7" fill="var(--ink)" />
          <path d="M 38 71 Q 45 62 52 71 Q 45 68 38 71 Z" fill="var(--chalk)" />
          <circle cx="14" cy="108" r="12" fill="var(--ink)" />
          <circle cx="14" cy="108" r="4.5" fill="var(--muted-2)" />
          <circle cx="76" cy="108" r="12" fill="var(--ink)" />
          <circle cx="76" cy="108" r="4.5" fill="var(--muted-2)" />
          <rect x="0" y="112" width="90" height="16" rx="4" fill="var(--muted-2)" />
          <rect x="0" y="112" width="90" height="5" fill="var(--chalk)" opacity="0.5" />
        </svg>
      ))}
    </div>
  );
}
