"use client";

import { useState } from "react";
import { createSupplierOrderAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/currency";

type ProductWithSupplier = {
  id: string;
  supplier_id: string;
  name: string;
  category: string | null;
  price: number;
  min_order_qty: number;
  stock_available: number;
  supplier_name: string;
  supplier_city: string;
};

export function SupplierMarketplace({
  products,
  orders,
}: {
  products: ProductWithSupplier[];
  orders: Array<{ id: string; total_amount: number | string; status: string; payment_method: string; created_at: string }>;
}) {
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  async function orderProduct(productId: string) {
    const qty = Math.max(1, Number(qtyById[productId] ?? 1));
    const result = await createSupplierOrderAction({
      supplierProductId: productId,
      quantity: qty,
      paymentMethod: "qris",
    });
    if (!result.ok || !result.orderId) {
      setMessage(result.message);
      return;
    }

    const invoiceRes = await fetch("/api/payments/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: result.totalAmount,
        method: "qris",
        context: "order",
        orderId: result.orderId,
      }),
    });
    const invoiceData = await invoiceRes.json();
    if (!invoiceRes.ok) {
      setMessage(`${result.message} Tapi invoice gagal dibuat.`);
      return;
    }
    setMessage(`${result.message} Link bayar: ${invoiceData.invoiceUrl}`);
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Katalog supplier</h2>
          {products.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada produk supplier.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="rounded-2xl border bg-white p-3">
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-zinc-500">
                  {product.supplier_name} • {product.supplier_city}
                </p>
                <p className="text-sm font-semibold">{formatRupiah(product.price)}</p>
                <p className="text-xs text-zinc-500">MOQ {product.min_order_qty} • stok {product.stock_available}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-9 rounded-xl"
                    value={qtyById[product.id] ?? product.min_order_qty}
                    onChange={(e) =>
                      setQtyById((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))
                    }
                  />
                  <Button className="rounded-xl" onClick={() => orderProduct(product.id)}>
                    Restock sekarang
                  </Button>
                </div>
              </div>
            ))
          )}
          {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold">Order terbaru</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada order.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border p-3">
                <p className="text-sm font-medium">
                  {formatRupiah(Number(order.total_amount))} • {order.payment_method.toUpperCase()}
                </p>
                <p className="text-xs text-zinc-500">
                  {order.status} • {new Date(order.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
