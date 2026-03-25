"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function AiInsightsPanel() {
  const { state } = useDemoSim();
  const insights = state.insights.slice(0, 5);
  const latest = insights[0];

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-3 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-zinc-700" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              AI Insights
            </p>
          </div>
          {/* Live pulse */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[10px] font-semibold text-emerald-600">Live</p>
          </div>
        </div>

        {latest ? (
          <div className="rounded-2xl border-l-4 border-l-zinc-900 bg-zinc-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Terbaru</p>
            <p className="mt-1 text-sm font-bold text-zinc-900">{latest.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{latest.answer}</p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-zinc-400">Menunggu data pertama...</p>
          </div>
        )}

        {insights.length > 1 && (
          <div className="space-y-2">
            {insights.slice(1).map((ins) => (
              <div key={ins.id} className="rounded-2xl border bg-white p-3">
                <p className="text-xs font-bold text-zinc-900">{ins.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{ins.answer}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
