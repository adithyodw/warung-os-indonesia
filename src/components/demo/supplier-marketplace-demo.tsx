"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/currency";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function SupplierMarketplaceDemo() {
  const { state, activeWarungId, placeSupplierRestock, getWarungAlerts } = useDemoSim();
  const warung = state.warungs.find((w) => w.id === activeWarungId) ?? state.warungs[0];
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [orderedIds, setOrderedIds] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => getWarungAlerts(activeWarungId), [activeWarungId, getWarungAlerts]);

  function handleRestock(spId: string, qty: number) {
    placeSupplierRestock(activeWarungId, spId, qty);
    setOrderedIds((prev) => new Set(prev).add(spId));
    setTimeout(() => {
      setOrderedIds((prev) => {
        const next = new Set(prev);
        next.delete(spId);
        return next;
      });
    }, 2500);
  }

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-zinc-700" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Supplier Marketplace
          </p>
        </div>

        {/* Warung target */}
        <div className="flex items-center justify-between rounded-2xl border bg-zinc-50 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Warung tujuan
            </p>
            <p className="mt-0.5 text-sm font-bold text-zinc-900">{warung.name}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              alerts.length
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {alerts.length ? `${alerts.length} stok rendah` : "Stok aman"}
          </span>
        </div>

        {/* Product list */}
        <div className="space-y-2">
          {state.supplierProducts.map((sp) => {
            const defaultQty = sp.minOrderQty;
            const qty = qtyById[sp.id] ?? defaultQty;
            const isOrdered = orderedIds.has(sp.id);
            const total = qty * sp.price;

            return (
              <div key={sp.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{sp.name}</p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">
                        {sp.supplierName} · MOQ {sp.minOrderQty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-zinc-900">
                      {formatRupiah(sp.price)}
                    </p>
                    <p className="text-[10px] text-zinc-400">per item</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-9 w-20 rounded-xl text-center text-sm font-semibold"
                    value={qty}
                    min={sp.minOrderQty}
                    onChange={(e) =>
                      setQtyById((prev) => ({
                        ...prev,
                        [sp.id]: Math.max(sp.minOrderQty, Number(e.target.value)),
                      }))
                    }
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold tabular-nums text-zinc-700">
                      Total: {formatRupiah(total)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className={`rounded-xl text-xs transition-all ${
                      isOrdered
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-zinc-900 hover:bg-zinc-800"
                    }`}
                    onClick={() => handleRestock(sp.id, qty)}
                    disabled={isOrdered}
                  >
                    {isOrdered ? "Dikirim" : "Restock"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-zinc-400">
          Stok warung akan diperbarui dalam beberapa detik setelah order dikirim.
        </p>
      </CardContent>
    </Card>
  );
}
