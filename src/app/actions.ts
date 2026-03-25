"use server";

import { revalidatePath } from "next/cache";
import { getRequiredUser } from "@/lib/auth";
import { calculateLendingScore, calculateLoanInterest } from "@/lib/lending";
import { getServerSupabase } from "@/lib/supabase/server";
import { getLendingMetrics } from "@/lib/warung-metrics";

type SaleItemInput = {
  productId: string | null;
  name: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
};

export async function signOutAction() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
}

export async function createSaleAction(items: SaleItemInput[]) {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();
  const { data: warung } = await supabase
    .from("warungs")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const validItems = items
    .map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      sellingPrice: Number(item.sellingPrice),
      costPrice: Number(item.costPrice),
    }))
    .filter(
      (item) =>
        item.name.trim().length > 0 &&
        item.quantity > 0 &&
        item.sellingPrice >= 0 &&
        item.costPrice >= 0,
    );

  if (validItems.length === 0) {
    return { ok: false, message: "Isi minimal 1 item jualan dulu ya." };
  }

  let total = 0;
  let profit = 0;

  const preparedItems = validItems.map((item) => {
    const lineTotal = item.sellingPrice * item.quantity;
    const lineProfit = (item.sellingPrice - item.costPrice) * item.quantity;
    total += lineTotal;
    profit += lineProfit;
    return {
      product_id: item.productId,
      name_snapshot: item.name,
      quantity: item.quantity,
      price: item.sellingPrice,
      cost: item.costPrice,
    };
  });

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      warung_id: warung?.id ?? null,
      total,
      profit,
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    return { ok: false, message: "Gagal simpan transaksi. Coba lagi." };
  }

  const { error: itemError } = await supabase.from("transaction_items").insert(
    preparedItems.map((item) => ({
      transaction_id: transaction.id,
      ...item,
    })),
  );

  if (itemError) {
    return { ok: false, message: "Transaksi masuk, tapi item gagal tersimpan." };
  }

  const productItems = validItems.filter((item) => item.productId);
  if (productItems.length > 0) {
    const productIds = productItems.map((item) => item.productId!);
    const { data: products } = await supabase
      .from("products")
      .select("id,stock")
      .eq("user_id", user.id)
      .in("id", productIds);

    const byId = new Map((products ?? []).map((product) => [product.id, product.stock]));

    for (const item of productItems) {
      const current = byId.get(item.productId!);
      if (current === undefined) continue;
      const nextStock = Math.max(0, current - item.quantity);
      await supabase.from("products").update({ stock: nextStock }).eq("id", item.productId!);
      byId.set(item.productId!, nextStock);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/jualan");
  revalidatePath("/stok");
  revalidatePath("/ai-chat");

  return { ok: true, message: "Transaksi berhasil disimpan." };
}

export async function addProductAction(input: {
  name: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
}) {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  if (!input.name.trim()) {
    return { ok: false, message: "Nama barang wajib diisi." };
  }

  const payload = {
    user_id: user.id,
    warung_id: null as string | null,
    name: input.name.trim(),
    cost_price: Number(input.costPrice),
    selling_price: Number(input.sellingPrice),
    stock: Number(input.stock),
  };

  const { data: warung } = await supabase
    .from("warungs")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  payload.warung_id = warung?.id ?? null;

  const { error } = await supabase.from("products").insert(payload);

  if (error) {
    return { ok: false, message: "Gagal tambah produk." };
  }

  revalidatePath("/stok");
  revalidatePath("/jualan");
  revalidatePath("/dashboard");
  return { ok: true, message: "Produk baru berhasil ditambah." };
}

export async function updateStockAction(productId: string, delta: number) {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const { data: product } = await supabase
    .from("products")
    .select("id,stock")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (!product) {
    return { ok: false, message: "Produk tidak ditemukan." };
  }

  const nextStock = Math.max(0, product.stock + delta);
  const { error } = await supabase
    .from("products")
    .update({ stock: nextStock })
    .eq("id", productId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: "Gagal update stok." };
  }

  revalidatePath("/stok");
  revalidatePath("/jualan");
  revalidatePath("/dashboard");
  return { ok: true, message: "Stok berhasil diupdate." };
}

export async function applyLoanAction(input: { amount: number; tenorDays: number }) {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const { data: warung } = await supabase
    .from("warungs")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!warung) {
    return { ok: false, message: "Profil warung belum lengkap." };
  }

  const metrics = await getLendingMetrics(supabase, user.id);
  const scoring = calculateLendingScore(metrics);
  const amount = Number(input.amount || scoring.suggestedAmount);
  const tenor = Number(input.tenorDays || 14);
  const { interestRate, totalRepayment } = calculateLoanInterest(amount, tenor);

  const status = scoring.approved ? "approved" : "rejected";
  const { data: loan, error } = await supabase
    .from("loans")
    .insert({
    user_id: user.id,
    warung_id: warung.id,
    amount,
    tenor_days: tenor,
    interest_rate: interestRate,
    score: scoring.score,
    risk_level: scoring.riskLevel,
    status,
  })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: "Gagal simpan pengajuan pinjaman." };
  }

  if (loan && scoring.approved) {
    const due = new Date();
    due.setDate(due.getDate() + tenor);
    await supabase.from("loan_repayments").insert({
      loan_id: loan.id,
      user_id: user.id,
      amount: totalRepayment,
      due_date: due.toISOString().slice(0, 10),
      status: "pending",
    });
  }

  revalidatePath("/pembiayaan");
  revalidatePath("/admin");
  return {
    ok: true,
    approved: scoring.approved,
    suggestedAmount: scoring.suggestedAmount,
    score: scoring.score,
    message: scoring.approved
      ? "Pengajuan disetujui. Tim akan proses pencairan."
      : "Pengajuan belum memenuhi skor minimum.",
  };
}

export async function createSupplierOrderAction(input: {
  supplierProductId: string;
  quantity: number;
  paymentMethod: "qris" | "va";
}) {
  const user = await getRequiredUser();
  const supabase = await getServerSupabase();

  const { data: warung } = await supabase
    .from("warungs")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!warung) return { ok: false, message: "Profil warung belum lengkap." };

  const { data: supplierProduct } = await supabase
    .from("supplier_products")
    .select("id,supplier_id,price,name")
    .eq("id", input.supplierProductId)
    .maybeSingle();

  if (!supplierProduct) {
    return { ok: false, message: "Produk supplier tidak ditemukan." };
  }

  const quantity = Math.max(1, Number(input.quantity || 1));
  const totalAmount = Number(supplierProduct.price) * quantity;
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      warung_id: warung.id,
      supplier_id: supplierProduct.supplier_id,
      supplier_product_id: supplierProduct.id,
      quantity,
      total_amount: totalAmount,
      payment_method: input.paymentMethod,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error || !order) return { ok: false, message: "Gagal buat order." };

  revalidatePath("/supplier");
  revalidatePath("/admin");
  return {
    ok: true,
    orderId: order.id,
    totalAmount,
    message: "Order supplier berhasil dibuat. Lanjut pembayaran.",
  };
}
