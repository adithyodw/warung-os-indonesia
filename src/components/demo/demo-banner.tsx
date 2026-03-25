"use client";

import { RefreshCw, Radio } from "lucide-react";

export function DemoBanner({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Radio className="h-4 w-4 shrink-0 text-zinc-600" />
        <div>
          <p className="text-sm font-semibold text-zinc-900">Live Demo</p>
          <p className="text-xs text-zinc-500">
            Data bergerak otomatis setiap beberapa detik untuk mensimulasikan operasional warung
            nyata.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-2 self-start rounded-2xl border bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 md:self-auto"
        onClick={onReset}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Reset simulasi
      </button>
    </div>
  );
}
