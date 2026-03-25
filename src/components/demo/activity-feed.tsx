"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

function kindLabel(kind: string) {
  if (kind === "sales") return "Sales";
  if (kind === "payment_pending") return "Pembayaran pending";
  if (kind === "payment_paid") return "Pembayaran paid";
  if (kind === "stock_low") return "Stok low";
  if (kind === "supplier_order") return "Restock supplier";
  if (kind === "loan_update") return "Lending";
  if (kind === "ai_insight") return "AI";
  return kind;
}

export function ActivityFeed() {
  const { state } = useDemoSim();
  const items = state.activity.slice(0, 14);

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600">Belum ada aktivitas.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="rounded-2xl border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{it.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(it.createdAt).toLocaleTimeString("id-ID")}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-2xl bg-white">
                  {kindLabel(it.kind)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

