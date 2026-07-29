// components/ChipInAnimation.tsx
// Plays when the user submits the form: a wedge chips the ball onto
// the green and into the cup, with a synthesized "plink" and a short
// burst of applause. Sounds are generated with the Web Audio API
// rather than loaded from external files — no licensing concerns,
// no broken-link risk, always available offline-first.
//
// Respects prefers-reduced-motion: skips the visual flight animation
// and completes quickly, but still plays a brief sound cue.

"use client";

import { useEffect, useRef } from "react";

interface ChipInAnimationProps {
  audioContext: AudioContext | null;
  onComplete: () => void;
}

const ANIMATION_DURATION_MS = 2000;
const REDUCED_MOTION_DURATION_MS = 500;

function playCupPlink(ctx: AudioContext, when: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(900, when);
  osc.frequency.exponentialRampToValueAtTime(300, when + 0.15);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.3, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.3);

  // second, brighter partial for a metallic "cup" ring
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1800, when);
  gain2.gain.setValueAtTime(0.0001, when);
  gain2.gain.exponentialRampToValueAtTime(0.15, when + 0.005);
  gain2.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(when);
  osc2.stop(when + 0.1);
}

function playApplause(ctx: AudioContext, when: number, duration = 0.9) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 3000;
  bandpass.Q.value = 0.6;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(0.22, when + 0.15);
  // uneven bumps so it reads as a crowd rather than a flat hiss
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    const t = when + 0.15 + (i * (duration - 0.15)) / steps;
    gain.gain.linearRampToValueAtTime(0.14 + Math.random() * 0.12, t);
  }
  gain.gain.linearRampToValueAtTime(0.0001, when + duration);

  noise.connect(bandpass).connect(gain).connect(ctx.destination);
  noise.start(when);
  noise.stop(when + duration);
}

export default function ChipInAnimation({ audioContext, onComplete }: ChipInAnimationProps) {
  const playedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : ANIMATION_DURATION_MS;

    if (audioContext && !playedRef.current) {
      playedRef.current = true;
      const now = audioContext.currentTime;
      const cupDelay = prefersReducedMotion ? 0.15 : 1.84;
      playCupPlink(audioContext, now + cupDelay);
      playApplause(audioContext, now + cupDelay + 0.05);
    }

    const timer = setTimeout(onComplete, duration + 200);
    return () => clearTimeout(timer);
  }, [audioContext, onComplete]);

  return (
    <div className="chipin-stage" aria-hidden="true">
      <svg viewBox="0 0 400 160" className="chipin-svg">
        <ellipse cx="200" cy="130" rx="200" ry="30" fill="var(--fairway-light)" />
        <ellipse cx="340" cy="98" rx="34" ry="10" fill="#163025" />
        <ellipse cx="340" cy="98" rx="9" ry="4" fill="#0D1B14" />
        <line x1="340" y1="60" x2="340" y2="98" stroke="var(--chalk)" strokeWidth="2" />
        <polygon points="340,60 340,72 358,66" fill="var(--flag)" className="chipin-flag" />

        <g className="chipin-club">
          <line x1="0" y1="0" x2="26" y2="-30" stroke="#B9C8BE" strokeWidth="4" strokeLinecap="round" />
          <rect x="20" y="-34" width="14" height="10" rx="2" fill="var(--sand)" transform="rotate(35 20 -34)" />
        </g>

        <g className="chipin-dust">
          <circle cx="0" cy="0" r="3" fill="var(--paper)" opacity="0.6" />
          <circle cx="6" cy="-2" r="2" fill="var(--paper)" opacity="0.5" />
          <circle cx="-5" cy="-1" r="2" fill="var(--paper)" opacity="0.5" />
        </g>

        <g className="chipin-ball">
          <circle cx="0" cy="0" r="6" fill="var(--chalk)" stroke="#B9C8BE" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}
