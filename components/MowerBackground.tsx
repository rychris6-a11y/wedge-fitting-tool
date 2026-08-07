// components/MowerBackground.tsx
// Ported from Claude Design's "Fairway Stripe Texture" demo card.
// The body's background already has the striped texture applied
// statically (see globals.css). This component sits on top of it as
// a solid flat-green mask, then animates a clip-path reveal as a
// small mower SVG travels diagonally across the screen once on page
// load -- so it looks like the stripes are being mowed into
// existence, rather than just appearing instantly.
//
// Runs once, not on a loop -- continuous motion behind an
// interactive form is more distracting than charming, and drains
// battery on mobile for no real ongoing benefit once the reveal has
// made its point. The mask removes itself entirely once done,
// leaving the already-present static striped background exactly as
// it always was.

"use client";

import { useEffect, useRef } from "react";

const DURATION_MS = 4200;
const MARGIN = 40;
// Matches the 100deg angle used in --texture-fairway-stripes (100 - 90 = 10deg from vertical)
const STRIPE_ANGLE_RAD = (10 * Math.PI) / 180;

export default function MowerBackground() {
  const maskRef = useRef<HTMLDivElement>(null);
  const mowerRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Skip the animated reveal entirely -- remove the mask so the
      // already-static striped background just shows immediately.
      containerRef.current?.remove();
      return;
    }

    const mask = maskRef.current;
    const mower = mowerRef.current;
    if (!mask || !mower) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const tanA = Math.tan(STRIPE_ANGLE_RAD);
    const yStart = -MARGIN;
    const yEnd = H + MARGIN;
    const travelDy = yEnd - yStart;
    const travelDx = -travelDy * tanA;
    const angleForward = (Math.atan2(travelDx, -travelDy) * 180) / Math.PI;
    const xStart = W / 2 - travelDx / 2;
    const xEnd = xStart + travelDx;

    let startTime: number | null = null;
    let rafId: number;

    function frame(now: number) {
      if (startTime === null) startTime = now;
      const t = Math.min((now - startTime) / DURATION_MS, 1);
      // ease-in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const cx = xStart + (xEnd - xStart) * eased;
      const cy = yStart + (yEnd - yStart) * eased;

      if (mower) {
        mower.style.left = `${cx}px`;
        mower.style.top = `${cy}px`;
        mower.style.transform = `translate(-50%, -50%) rotate(${angleForward}deg)`;
      }

      if (mask) {
        const y0 = ((cy + tanA * (0 - cx)) / H) * 100;
        const y1 = ((cy + tanA * (W - cx)) / H) * 100;
        mask.style.clipPath = `polygon(0% 0%, 100% 0%, 100% ${y1}%, 0% ${y0}%)`;
      }

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        // Done -- remove the whole overlay. The static striped
        // background underneath was there the entire time.
        setTimeout(() => containerRef.current?.remove(), 400);
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={containerRef} className="mower-bg-container" aria-hidden="true">
      <div ref={maskRef} className="mower-bg-mask" />
      <svg ref={mowerRef} className="mower-bg-mower" viewBox="0 0 90 130">
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
    </div>
  );
}
