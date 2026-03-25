"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createSaleAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/currency";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
};

type DraftManualItem = {
  name: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
};

export function SaleForm({ products }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [manualItems, setManualItems] = useState<DraftManualItem[]>([]);
  const [manualDraft, setManualDraft] = useState<DraftManualItem>({
    name: "",
    sellingPrice: 0,
    costPrice: 0,
    quantity: 1,
  });

  const selectedRows = useMemo(() => {
    return products
      .filter((product) => selected[product.id] > 0)
      .map((product) => {
        const quantity = selected[product.id];
        return {
          productId: product.id,
          name: product.name,
          quantity,
          sellingPrice: product.selling_price,
          costPrice: product.cost_price,
          subtotal: product.selling_price * quantity,
          untung: (product.selling_price - product.cost_price) * quantity,
        };
      });
  }, [products, selected]);

  const allItems = [
    ...selectedRows.map((row) => ({
      productId: row.productId,
      name: row.name,
      quantity: row.quantity,
      sellingPrice: row.sellingPrice,
      costPrice: row.costPrice,
    })),
    ...manualItems.map((item) => ({
      productId: null,
      name: item.name,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      costPrice: item.costPrice,
    })),
  ];

  const total = allItems.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  const profit = allItems.reduce(
    (acc, item) => acc + (item.sellingPrice - item.costPrice) * item.quantity,
    0,
  );

  function addFromCatalog(productId: string) {
    setSelected((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }

  function subtractFromCatalog(productId: string) {
    setSelected((prev) => {
      const next = Math.max(0, (prev[productId] ?? 0) - 1);
      return { ...prev, [productId]: next };
    });
  }

  function addManualItem() {
    if (!manualDraft.name.trim() || manualDraft.quantity <= 0) return;
    setManualItems((prev) => [...prev, manualDraft]);
    setManualDraft({ name: "", sellingPrice: 0, costPrice: 0, quantity: 1 });
  }

  function removeManualItem(index: number) {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await createSaleAction(allItems);
      setMessage(result.message);

      if (result.ok) {
        setSelected({});
        setManualItems([]);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Pilih produk</h2>
          {products.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada produk. Tambah dulu di menu Stok.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border bg-white p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-zinc-500">
                      {formatRupiah(product.selling_price)} | stok {product.stock}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 rounded-xl p-0"
                      onClick={() => subtractFromCatalog(product.id)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm">{selected[product.id] ?? 0}</span>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      onClick={() => addFromCatalog(product.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Input manual</h2>
          <Input
            placeholder="Nama barang"
            value={manualDraft.name}
            onChange={(event) => setManualDraft((prev) => ({ ...prev, name: event.target.value }))}
            className="h-11 rounded-2xl"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Harga jual"
              value={manualDraft.sellingPrice}
              onChange={(event) =>
                setManualDraft((prev) => ({ ...prev, sellingPrice: Number(event.target.value) }))
              }
              className="h-11 rounded-2xl"
            />
            <Input
              type="number"
              placeholder="Modal"
              value={manualDraft.costPrice}
              onChange={(event) =>
                setManualDraft((prev) => ({ ...prev, costPrice: Number(event.target.value) }))
              }
              className="h-11 rounded-2xl"
            />
          </div>
          <Input
            type="number"
            placeholder="Jumlah"
            value={manualDraft.quantity}
            onChange={(event) =>
              setManualDraft((prev) => ({ ...prev, quantity: Number(event.target.value) }))
            }
            className="h-11 rounded-2xl"
          />
          <Button type="button" variant="secondary" className="w-full rounded-2xl" onClick={addManualItem}>
            Tambah item manual
          </Button>

          {manualItems.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-xl bg-zinc-50 p-2">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-zinc-500">
                  {item.quantity} x {formatRupiah(item.sellingPrice)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => removeManualItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Ringkasan transaksi</h2>
          <div className="flex items-center justify-between text-sm">
            <span>Total penjualan</span>
            <span className="font-semibold">{formatRupiah(total)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Estimasi untung</span>
            <span className="font-semibold text-emerald-700">{formatRupiah(profit)}</span>
          </div>
          <Button className="h-12 w-full rounded-2xl text-base" disabled={isPending} onClick={handleSave}>
            {isPending ? "Menyimpan..." : "Simpan transaksi"}
          </Button>
          {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
