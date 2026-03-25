"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoBanner({ onReset }: { onReset: () => void }) {
  return (
    <div className="mb-4 rounded-3xl border bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Demo Mode Active</p>
          <p className="text-xs text-zinc-600">Data bergerak real-time untuk simulasi warung.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset data
          </Button>
        </div>
      </div>
    </div>
  );
}

