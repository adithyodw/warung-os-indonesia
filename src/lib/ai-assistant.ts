import Anthropic from "@anthropic-ai/sdk";
import { getInsightData } from "@/lib/analytics";
import { formatRupiah } from "@/lib/currency";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateAssistantAnswer(
  supabase: SupabaseClient,
  userId: string,
  prompt: string,
) {
  const insight = await getInsightData(supabase, userId);

  const fallback = buildFallbackAnswer(prompt, insight);
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return fallback;

  const anthropic = new Anthropic({ apiKey });
  const system = `
Kamu asisten bisnis warung Indonesia.
Jawaban harus ringkas, bahasa sederhana, dan actionable.
Data:
- Penjualan hari ini: ${insight.totalPenjualanHariIni}
- Untung hari ini: ${insight.totalUntungHariIni}
- Produk terlaris: ${insight.produkTerlaris}
- Stok menipis: ${insight.stokMenipis.map((s) => `${s.name}(${s.stock})`).join(", ") || "Tidak ada"}
`;

  const result = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 250,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = result.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n")
    .trim();
  return text || fallback;
}

function buildFallbackAnswer(question: string, insight: Awaited<ReturnType<typeof getInsightData>>) {
  const lower = question.toLowerCase();
  if (lower.includes("untung")) {
    return `Untung hari ini sekitar ${formatRupiah(insight.totalUntungHariIni)}.`;
  }
  if (lower.includes("laku") || lower.includes("terlaris")) {
    return `Produk terlaris: ${insight.produkTerlaris} (${insight.jumlahProdukTerlaris} terjual).`;
  }
  if (lower.includes("stok")) {
    if (!insight.stokMenipis.length) return "Stok masih aman, belum ada yang hampir habis.";
    return `Stok hampir habis: ${insight.stokMenipis
      .map((item) => `${item.name} (${item.stock})`)
      .join(", ")}.`;
  }
  return `Penjualan hari ini ${formatRupiah(insight.totalPenjualanHariIni)} dan untung ${formatRupiah(
    insight.totalUntungHariIni,
  )}.`;
}
