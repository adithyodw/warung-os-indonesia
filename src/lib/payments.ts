import { formatRupiah } from "@/lib/currency";

type XenditCreateInvoiceInput = {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl?: string;
};

export async function createXenditInvoice(input: XenditCreateInvoiceInput) {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    return {
      ok: false,
      message: "XENDIT_SECRET_KEY belum diisi.",
    };
  }

  const payload = {
    external_id: input.externalId,
    amount: input.amount,
    payer_email: input.payerEmail,
    description: input.description,
    currency: "IDR",
    success_redirect_url: input.successRedirectUrl,
    payment_methods: ["QRIS", "BCA", "BNI", "BRI", "MANDIRI"],
  };

  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    return { ok: false, message: `Gagal buat invoice: ${errText}` };
  }

  const data = await response.json();
  return { ok: true, data };
}

export function buildPaymentDescription(context: "loan" | "order", amount: number) {
  return context === "loan"
    ? `Pembayaran cicilan pinjaman warung sebesar ${formatRupiah(amount)}`
    : `Pembayaran restock supplier sebesar ${formatRupiah(amount)}`;
}
