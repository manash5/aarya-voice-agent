"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

/* ============================================================================
   Voiceprints.

   Every assistant gets a deterministic bar pattern derived from its id, so it
   carries the same little signature everywhere it appears - list rows, editor
   header, call logs. It's a voice product; the identity should be audio, not
   another rounded square with an initial in it.
   ========================================================================== */

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable pseudo-random bar heights in [0.22, 1] for a given seed. */
export function voiceprint(seed: string, bars: number) {
  let state = hash(seed) || 1;
  return Array.from({ length: bars }, () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return 0.22 + (state % 1000) / 1000 * 0.78;
  });
}

export function VoiceGlyph({
  seed,
  color,
  bars = 7,
  className,
}: {
  seed: string;
  color?: string;
  bars?: number;
  className?: string;
}) {
  const heights = voiceprint(seed, bars);
  const gap = 1.15;
  const width = 2;
  const total = bars * width + (bars - 1) * gap;

  return (
    <svg
      viewBox={`0 0 ${total} 20`}
      className={cn("shrink-0", className)}
      aria-hidden
      preserveAspectRatio="none"
    >
      {heights.map((height, index) => {
        const h = Math.max(2, height * 18);
        return (
          <rect
            key={index}
            x={index * (width + gap)}
            y={(20 - h) / 2}
            width={width}
            height={h}
            rx={1}
            fill={color ?? "currentColor"}
          />
        );
      })}
    </svg>
  );
}

/* ============================================================================
   Live waveform.

   Reads the actual mic and agent audio through an AnalyserNode. When there is
   no stream yet the bars drift on a sine so the surface is alive but clearly
   idle - the difference between "waiting" and "listening" is legible without
   reading a word of copy.
   ========================================================================== */

export function LiveWaveform({
  streams,
  active,
  bars = 48,
  className,
}: {
  streams: MediaStream[];
  active: boolean;
  bars?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(undefined);
  const levelsRef = useRef<number[]>(new Array(bars).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Source = { analyser: AnalyserNode; data: Uint8Array<ArrayBuffer> };
    let audioCtx: AudioContext | null = null;
    const sources: Source[] = [];

    if (active && streams.length > 0) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) {
        audioCtx = new Ctor();
        for (const stream of streams) {
          if (stream.getAudioTracks().length === 0) continue;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.75;
          audioCtx.createMediaStreamSource(stream).connect(analyser);
          sources.push({
            analyser,
            data: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
          });
        }
      }
    }

    const styles = getComputedStyle(document.documentElement);
    const activeColor = styles.getPropertyValue("--accent").trim() || "#8b8ff0";
    const idle = styles.getPropertyValue("--text-3").trim() || "#74716d";

    const start = performance.now();

    function draw(now: number) {
      frameRef.current = requestAnimationFrame(draw);
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Fold every analyser's spectrum into one band per bar, taking the
      // loudest source so the caller and the agent share the same meter.
      const targets = new Array<number>(bars).fill(0);
      for (const { analyser, data } of sources) {
        analyser.getByteFrequencyData(data);
        const step = Math.floor(data.length / bars) || 1;
        for (let i = 0; i < bars; i += 1) {
          let sum = 0;
          for (let j = 0; j < step; j += 1) sum += data[i * step + j] ?? 0;
          // Lift the top end, which is always quieter, so the shape stays even.
          const value = (sum / step / 255) * (1 + (i / bars) * 1.5);
          targets[i] = Math.max(targets[i], Math.min(1, value));
        }
      }

      const elapsed = (now - start) / 1000;
      const levels = levelsRef.current;

      for (let i = 0; i < bars; i += 1) {
        let target = targets[i];
        if (sources.length === 0) {
          // Idle drift: a slow travelling sine, tapered at both ends.
          const taper = Math.sin((i / (bars - 1)) * Math.PI);
          target = (0.3 + 0.22 * Math.sin(elapsed * 1.5 - i * 0.34)) * (0.3 + taper * 0.7);
        }
        // Fast attack, slow release, the way a real meter behaves.
        const ease = target > levels[i] ? 0.45 : 0.11;
        levels[i] += (target - levels[i]) * ease;

        const barWidth = Math.max(2, width / bars - 2);
        const x = i * (width / bars) + (width / bars - barWidth) / 2;
        const h = Math.max(2, levels[i] * height * 0.92);
        const y = (height - h) / 2;

        ctx.fillStyle = sources.length > 0 ? activeColor : idle;
        ctx.globalAlpha = sources.length > 0 ? 0.4 + levels[i] * 0.6 : 0.45;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, barWidth / 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      void audioCtx?.close();
    };
  }, [streams, active, bars]);

  return <canvas ref={canvasRef} className={cn("h-full w-full", className)} />;
}
