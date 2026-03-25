"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Bot, SendHorizontal, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useDemoSim } from "@/components/demo/demo-sim-provider";
import { formatRupiah } from "@/lib/currency";

function includesAny(text: string, needles: string[]) {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
}

function todayISODate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const QUICK_REPLIES = [
  "Untung hari ini?",
  "Stok hampir habis?",
  "Produk paling laku?",
  "Perlu restock?",
];

export function WhatsAppSimulation() {
  const { state, activeWarungId, getWarungAlerts } = useDemoSim();
  const warung = state.warungs.find((w) => w.id === activeWarungId) ?? state.warungs[0];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lowStockAlerts = useMemo(
    () => getWarungAlerts(activeWarungId),
    [activeWarungId, getWarungAlerts],
  );

  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; text: string }>
  >([
    {
      id: "m0",
      role: "assistant",
      text: `Halo. Ini panel simulasi asisten AI untuk ${warung.name}. Coba tanya: "Untung hari ini?" atau pilih contoh di bawah.`,
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function buildAnswer(userText: string) {
    const today = todayISODate();
    const txs = state.transactions.filter(
      (tx) => tx.warungId === activeWarungId && tx.createdAt.slice(0, 10) === today,
    );
    const profit = txs.reduce((acc, tx) => acc + tx.profit, 0);

    const top = state.todayTopProductByWarung[activeWarungId];
    const topProductName =
      state.products.find((p) => p.id === top?.productId)?.name ?? "—";

    if (includesAny(userText, ["untung", "profit"])) {
      if (!txs.length)
        return "Hari ini belum ada transaksi tercatat. Silakan tunggu simulasi berjalan beberapa detik.";
      return `Estimasi untung hari ini di ${warung.name}: ${formatRupiah(profit)} dari ${txs.length} transaksi.`;
    }

    if (includesAny(userText, ["stok", "habis", "hampir habis"])) {
      if (!lowStockAlerts.length)
        return "Stok saat ini aman. Tidak ada produk yang mendekati ambang batas rendah.";
      const items = lowStockAlerts
        .slice(0, 3)
        .map((a) => `${a.name} (sisa ${a.stock})`)
        .join(", ");
      return `Perhatian — stok hampir habis di ${warung.name}: ${items}. Segera lakukan restock.`;
    }

    if (includesAny(userText, ["paling laku", "terlaris", "laku", "produk"])) {
      return `Produk paling laku hari ini di ${warung.name}: ${topProductName} (${top?.quantity ?? 0} unit).`;
    }

    if (includesAny(userText, ["restock", "restok", "tambah stok"])) {
      if (!lowStockAlerts.length)
        return "Stok masih aman. Restock tidak terlalu mendesak saat ini.";
      const item = lowStockAlerts[0];
      return `Rekomendasi restock: ${item.name} di ${warung.name}. Sisa stok saat ini: ${item.stock}.`;
    }

    return `Pertanyaan diterima. Untuk ${warung.name}, saya bisa menjawab: untung hari ini, stok hampir habis, produk terlaris, atau kebutuhan restock.`;
  }

  async function send(overrideText?: string) {
    const userText = (overrideText ?? text).trim();
    if (!userText || busy) return;
    setText("");
    setBusy(true);
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: "user", text: userText }]);
    window.setTimeout(() => {
      const answer = buildAnswer(userText);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: "assistant", text: answer }]);
      setBusy(false);
    }, 800);
  }

  return (
    <Card className="rounded-3xl border bg-white/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-700" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              WhatsApp Simulation
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600">
            {warung.name}
          </span>
        </div>

        {/* Chat window */}
        <div className="h-[280px] overflow-y-auto rounded-2xl border bg-zinc-50 p-3">
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <Bot className="mr-2 mt-1 h-4 w-4 shrink-0 text-zinc-400" />
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "bg-zinc-900 text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-zinc-400" />
                <div className="rounded-2xl bg-white px-3.5 py-2.5 text-xs text-zinc-400 shadow-sm">
                  AI sedang memproses...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Quick replies */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              disabled={busy}
              className="rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              onClick={() => send(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pertanyaan..."
            className="min-h-14 flex-1 resize-none rounded-2xl text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            className="h-auto self-end rounded-2xl bg-zinc-900 px-4 hover:bg-zinc-800"
            onClick={() => send()}
            disabled={busy}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
