"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function SupplierMarketplaceDemo() {
  const { state, activeWarungId, placeSupplierRestock, getWarungAlerts } = useDemoSim();
  const warung = state.warungs.find((w) => w.id === activeWarungId) ?? state.warungs[0];

  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const alerts = useMemo(() => getWarungAlerts(activeWarungId), [activeWarungId, getWarungAlerts]);

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Supplier Marketplace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border bg-white p-3">
          <p className="text-sm font-semibold text-zinc-700">Warung tujuan</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">{warung.name}</p>
          <p className="mt-1 text-xs text-zinc-600">
            Alert stok: {alerts.length ? `${alerts.length} produk` : "stok aman"}
          </p>
        </div>

        <div className="space-y-2">
          {state.supplierProducts.map((sp) => {
            const defaultQty = sp.minOrderQty;
            const qty = qtyById[sp.id] ?? defaultQty;
            return (
              <div key={sp.id} className="rounded-2xl border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{sp.name}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {sp.supplierName} • MOQ {sp.minOrderQty}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-900">{formatRupiah(sp.price)} per item</p>
                  </div>
                  <Badge variant="outline" className="rounded-2xl bg-white">
                    {sp.category ?? "Umum"}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-10 rounded-2xl"
                    value={qty}
                    min={sp.minOrderQty}
                    onChange={(e) => setQtyById((prev) => ({ ...prev, [sp.id]: Math.max(sp.minOrderQty, Number(e.target.value)) }))}
                  />
                  <Button
                    className="h-10 rounded-2xl"
                    onClick={() => placeSupplierRestock(activeWarungId, sp.id, qty)}
                  >
                    Restock
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <p className="text-xs font-semibold text-zinc-600">Catatan simulasi</p>
          <p className="mt-1 text-sm text-zinc-700">
            Setelah restock dikirim, stok warung akan bertambah beberapa detik kemudian.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

