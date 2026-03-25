"use client";

import { useMemo } from "react";

type Point = { date: string; revenue: number };

export function RevenueLineChart({ points }: { points: Point[] }) {
  const { polyline } = useMemo(() => {
    if (points.length < 2) {
      return { polyline: "" };
    }
    const min = Math.min(...points.map((p) => p.revenue));
    const max = Math.max(...points.map((p) => p.revenue));
    const span = Math.max(1, max - min);
    const w = 320;
    const h = 120;
    const pad = 6;

    const coords = points.map((p, idx) => {
      const x = pad + (idx * (w - pad * 2)) / (points.length - 1);
      const t = (p.revenue - min) / span;
      const y = pad + (1 - t) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return { polyline: coords.join(" ") };
  }, [points]);

  const latest = points[points.length - 1]?.revenue ?? 0;

  return (
    <div className="rounded-3xl border bg-white/70 p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-zinc-900">Revenue 14 hari</p>
        <p className="text-xs text-zinc-600">Terakhir: Rp{Math.round(latest).toLocaleString("id-ID")}</p>
      </div>
      <div className="mt-2">
        <svg viewBox="0 0 320 120" className="h-28 w-full">
          <polyline
            points={polyline}
            fill="none"
            stroke="rgb(24 24 27)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

