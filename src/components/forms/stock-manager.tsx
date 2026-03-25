"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { addProductAction, updateStockAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { formatRupiah } from "@/lib/currency";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
};

export function StockManager({ products }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
  });

  function addProduct() {
    startTransition(async () => {
      const result = await addProductAction(form);
      setMessage(result.message);
      if (result.ok) {
        setForm({ name: "", costPrice: 0, sellingPrice: 0, stock: 0 });
      }
    });
  }

  function changeStock(productId: string, delta: number) {
    startTransition(async () => {
      const result = await updateStockAction(productId, delta);
      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Tambah produk</h2>
          <Input
            placeholder="Nama barang"
            value={form.name}
            className="h-11 rounded-2xl"
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Modal"
              value={form.costPrice}
              className="h-11 rounded-2xl"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, costPrice: Number(event.target.value) }))
              }
            />
            <Input
              type="number"
              placeholder="Harga jual"
              value={form.sellingPrice}
              className="h-11 rounded-2xl"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sellingPrice: Number(event.target.value) }))
              }
            />
          </div>
          <Input
            type="number"
            placeholder="Stok awal"
            value={form.stock}
            className="h-11 rounded-2xl"
            onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
          />
          <Button className="h-12 w-full rounded-2xl text-base" disabled={isPending} onClick={addProduct}>
            <Plus className="mr-2 h-5 w-5" />
            Simpan produk
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold">Daftar stok</h2>
          {products.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada produk.</p>
          ) : (
            products.map((product) => {
              const low = product.stock <= LOW_STOCK_THRESHOLD;
              return (
                <div key={product.id} className="rounded-2xl border bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-zinc-500">
                        Modal {formatRupiah(product.cost_price)} | Jual {formatRupiah(product.selling_price)}
                      </p>
                    </div>
                    {low ? (
                      <div className="flex items-center gap-1 rounded-xl bg-red-50 px-2 py-1 text-xs text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Stok hampir habis
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm">
                      Stok saat ini: <span className="font-bold">{product.stock}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={isPending}
                        onClick={() => changeStock(product.id, -1)}
                      >
                        -1
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl"
                        disabled={isPending}
                        onClick={() => changeStock(product.id, 5)}
                      >
                        +5
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
    </div>
  );
}
