"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function AiInsightsPanel() {
  const { state } = useDemoSim();
  const insights = state.insights.slice(0, 5);
  const latest = insights[0];

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {latest ? (
          <div className="rounded-2xl border bg-white p-3">
            <p className="text-xs font-semibold text-zinc-600">Terbaru</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{latest.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800">{latest.answer}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          {insights.length <= 1 ? null : (
            <p className="text-xs font-semibold text-zinc-600">Lainnya</p>
          )}
          {insights.slice(1).map((ins) => (
            <div key={ins.id} className="rounded-2xl border bg-white p-3">
              <p className="text-sm font-semibold text-zinc-900">{ins.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-800">{ins.answer}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

