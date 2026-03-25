"use client";

import { useMemo, useState } from "react";
import { Bot, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { formatRupiah } from "@/lib/currency";

function includesAny(text: string, needles: string[]) {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
}

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function WhatsAppSimulation() {
  const { state, activeWarungId, getWarungAlerts } = useDemoSim();
  const warung = state.warungs.find((w) => w.id === activeWarungId) ?? state.warungs[0];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const lowStockAlerts = useMemo(() => getWarungAlerts(activeWarungId), [activeWarungId, getWarungAlerts]);

  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string }>>([
    {
      id: "m0",
      role: "assistant",
      text: "Halo. Ini panel simulasi WhatsApp untuk Warung OS. Tulis pertanyaan seperti: Untung hari ini, Stok hampir habis, atau Produk paling laku.",
    },
  ]);

  function buildAnswer(userText: string) {
    const t = userText.toLowerCase();
    const today = todayISODate();
    const txs = state.transactions.filter((tx) => tx.warungId === activeWarungId && tx.createdAt.slice(0, 10) === today);
    const profit = txs.reduce((acc, tx) => acc + tx.profit, 0);

    const top = state.todayTopProductByWarung[activeWarungId];
    const topProductName = state.products.find((p) => p.id === top?.productId)?.name ?? "-";

    if (includesAny(t, ["untung", "profit"]) && includesAny(t, ["hari ini", "hari ini?"])) {
      if (!txs.length) return "Hari ini belum ada transaksi. Silakan coba input penjualan dulu di menu Jualan (simulasi).";
      return `Untung hari ini di ${warung.name} sekitar ${formatRupiah(profit)}.`;
    }

    if (includesAny(t, ["stok", "habis", "hampir habis"])) {
      if (!lowStockAlerts.length) return "Stok saat ini aman. Tidak ada produk yang mendekati ambang stok rendah.";
      const items = lowStockAlerts
        .slice(0, 3)
        .map((a) => `${a.name} (sisa ${a.stock})`)
        .join(", ");
      return `Stok hampir habis di ${warung.name}: ${items}. Sebaiknya restock dalam waktu dekat.`;
    }

    if (includesAny(t, ["produk", "barang"]) && includesAny(t, ["paling laku", "terlaris", "laku"])) {
      return `Produk paling laku hari ini: ${topProductName} (${top?.quantity ?? 0} terjual).`;
    }

    if (includesAny(t, ["paling laku", "terlaris", "laku"])) {
      return `Hari ini yang paling laku di ${warung.name} adalah ${topProductName} (${top?.quantity ?? 0} terjual).`;
    }

    if (includesAny(t, ["restock", "restok", "perlu restock", "tambah stok"])) {
      if (!lowStockAlerts.length) return "Stok saat ini masih aman. Restock tidak terlalu mendesak.";
      const item = lowStockAlerts[0];
      return `Perlu restock: ${item.name} di ${warung.name}. Stok saat ini sisa ${item.stock}.`;
    }

    return `Saya paham. Untuk ${warung.name}, Anda bisa tanya: untung hari ini, stok hampir habis, atau produk paling laku.`;
  }

  async function send() {
    if (!text.trim() || busy) return;
    const userText = text.trim();
    setText("");
    setBusy(true);

    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: "user", text: userText }]);

    window.setTimeout(() => {
      const answer = buildAnswer(userText);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: "assistant", text: answer }]);
      setBusy(false);
    }, 700);
  }

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Simulasi WhatsApp
          </span>
          <span className="text-xs text-zinc-600">{warung.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-[320px] overflow-y-auto rounded-2xl border bg-white p-3">
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "assistant"
                    ? "bg-zinc-100 text-zinc-900"
                    : "ml-auto bg-zinc-900 text-white"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy ? <div className="text-xs text-zinc-500">AI sedang merespon...</div> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Contoh: Untung hari ini"
            className="min-h-20 rounded-2xl text-base"
          />
          <div className="flex gap-2">
            <Button className="h-11 flex-1 rounded-2xl" onClick={send} disabled={busy}>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Kirim
            </Button>
            <Button
              className="h-11 rounded-2xl"
              variant="outline"
              onClick={() => setText("Untung hari ini?")}
              disabled={busy}
            >
              Contoh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

