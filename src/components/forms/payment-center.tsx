"use client";

import { useState } from "react";
import { QrCode, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/currency";

type PaymentRow = {
  id: string;
  reference: string;
  type: string;
  provider: string;
  status: string;
  amount: number | string;
  created_at: string;
};

export function PaymentCenter({ payments }: { payments: PaymentRow[] }) {
  const [amount, setAmount] = useState(100000);
  const [method, setMethod] = useState<"qris" | "va">("qris");
  const [payerEmail, setPayerEmail] = useState("owner@warung.id");
  const [message, setMessage] = useState("");

  async function createInvoice() {
    const res = await fetch("/api/payments/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method, payerEmail, context: "order" }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data?.message ?? "Gagal buat invoice.");
    setMessage(`Invoice siap. Link bayar: ${data.invoiceUrl}`);
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Buat pembayaran</h2>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-11 rounded-2xl"
          />
          <Input
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            className="h-11 rounded-2xl"
            placeholder="Email pembayar"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={method === "qris" ? "default" : "outline"}
              className="h-11 rounded-2xl"
              onClick={() => setMethod("qris")}
            >
              <QrCode className="mr-2 h-4 w-4" />
              QRIS
            </Button>
            <Button
              type="button"
              variant={method === "va" ? "default" : "outline"}
              className="h-11 rounded-2xl"
              onClick={() => setMethod("va")}
            >
              <Landmark className="mr-2 h-4 w-4" />
              Virtual Account
            </Button>
          </div>
          <Button className="h-12 w-full rounded-2xl text-base" onClick={createInvoice}>
            Buat invoice pembayaran
          </Button>
          {message ? <p className="text-xs text-zinc-600 break-all">{message}</p> : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <h2 className="font-semibold">Riwayat pembayaran</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada pembayaran.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="rounded-2xl border bg-white p-3">
                <p className="text-sm font-medium">{p.reference}</p>
                <p className="text-xs text-zinc-500">
                  {p.type.toUpperCase()} • {p.provider} • {new Date(p.created_at).toLocaleDateString("id-ID")}
                </p>
                <p className="mt-1 text-sm font-semibold">{formatRupiah(Number(p.amount))}</p>
                <p className="text-xs uppercase text-zinc-500">{p.status}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
