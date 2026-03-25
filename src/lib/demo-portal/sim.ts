export type DemoWarung = {
  id: string;
  name: string;
  city: string;
};

export type DemoProduct = {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  demandWeight: number; // semakin besar = semakin sering terjual
};

export type DemoTransactionItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
};

export type DemoTransaction = {
  id: string;
  warungId: string;
  createdAt: string; // ISO
  items: DemoTransactionItem[];
  total: number;
  profit: number;
};

export type DemoDailyPoint = {
  date: string; // YYYY-MM-DD
  revenue: number;
  profit: number;
};

export type DemoPayment = {
  id: string;
  warungId: string;
  method: "qris" | "va";
  reference: string;
  amount: number;
  status: "pending" | "paid";
  createdAt: string; // ISO
  paidAt?: string; // ISO
};

export type DemoLoanSnapshot = {
  warungId: string;
  score: number; // 0..100
  riskLevel: "low" | "medium" | "high";
  suggestedAmount: number;
  tenorDays: 7 | 14 | 30;
  interestRate: number;
  eligible: boolean;
};

export type DemoSupplierProduct = {
  id: string;
  name: string;
  category: string | null;
  supplierName: string;
  price: number;
  minOrderQty: number;
};

export type DemoRestockOrder = {
  id: string;
  warungId: string;
  supplierProductId: string;
  quantity: number;
  status: "pending" | "completed";
  createdAt: string; // ISO
  completedAt?: string; // ISO
};

export type DemoInsight = {
  id: string;
  createdAt: string; // ISO
  title: string;
  answer: string;
};

export type DemoChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string; // ISO
};

export type DemoActivity = {
  id: string;
  createdAt: string; // ISO
  kind:
    | "sales"
    | "payment_pending"
    | "payment_paid"
    | "stock_low"
    | "supplier_order"
    | "loan_update"
    | "ai_insight";
  message: string;
};

export type DemoState = {
  demoModeEnabled: true;
  warungs: DemoWarung[];
  products: DemoProduct[]; // master catalog (same ids across warungs)
  // stocks[warungId][productId] = qty
  stocks: Record<string, Record<string, number>>;
  daily: DemoDailyPoint[];
  transactions: DemoTransaction[]; // recent-ish
  payments: DemoPayment[]; // recent-ish
  loans: DemoLoanSnapshot[];
  supplierProducts: DemoSupplierProduct[];
  restockOrders: DemoRestockOrder[];
  insights: DemoInsight[]; // recent
  activity: DemoActivity[]; // recent feed
  // derived today stats (per warung)
  todayTopProductByWarung: Record<string, { productId: string; quantity: number }>;
};

const LOW_STOCK_THRESHOLD = 8;
const DAYS_BACK = 30;

function isoNow() {
  return new Date().toISOString();
}

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(rng: () => number, items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((acc, it) => acc + it.weight, 0);
  const r = rng() * total;
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (r <= acc) return it.value;
  }
  return items[items.length - 1].value;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeLoanScore(input: {
  avgDailyRevenue: number;
  transactionCount: number;
  growthRate: number;
  onTimeRepaymentRate: number;
}) {
  const revenueFactor = clamp(input.avgDailyRevenue / 2_000_000, 0, 1) * 35;
  const frequencyFactor = clamp(input.transactionCount / 60, 0, 1) * 25;
  const growthFactor = clamp((input.growthRate + 0.15) / 0.5, 0, 1) * 20;
  const paymentFactor = clamp(input.onTimeRepaymentRate, 0, 1) * 20;

  const score = Math.round(revenueFactor + frequencyFactor + growthFactor + paymentFactor);
  const riskLevel: "low" | "medium" | "high" =
    score >= 75 ? "low" : score >= 55 ? "medium" : "high";

  const approved = score >= 55;
  const baseAmount = input.avgDailyRevenue * 6;
  const multiplier = riskLevel === "low" ? 1.8 : riskLevel === "medium" ? 1.2 : 0.7;
  const suggestedAmount = Math.max(500_000, Math.round((baseAmount * multiplier) / 50_000) * 50_000);

  return { score, riskLevel, approved, suggestedAmount };
}

function computeInterestRate(risk: "low" | "medium" | "high", tenorDays: 7 | 14 | 30) {
  const base = risk === "low" ? 0.03 : risk === "medium" ? 0.05 : 0.08;
  const tenorMultiplier = tenorDays <= 7 ? 1 : tenorDays <= 14 ? 1.12 : 1.25;
  return base * tenorMultiplier;
}

function computeProfitForItems(items: DemoTransactionItem[]) {
  return items.reduce((acc, it) => acc + (it.price - it.cost) * it.quantity, 0);
}

function computeTotalForItems(items: DemoTransactionItem[]) {
  return items.reduce((acc, it) => acc + it.price * it.quantity, 0);
}

function todayDate() {
  return ymd(new Date());
}

function buildSeedProducts(): DemoProduct[] {
  return [
    {
      id: "indomie",
      name: "Indomie Goreng",
      category: "Mie Instan",
      costPrice: 2400,
      sellingPrice: 3000,
      demandWeight: 1.0,
    },
    {
      id: "aqua600",
      name: "Aqua 600ml",
      category: "Minuman",
      costPrice: 5400,
      sellingPrice: 7000,
      demandWeight: 0.8,
    },
    {
      id: "telur",
      name: "Telur (per kg)",
      category: "Sembako",
      costPrice: 32000,
      sellingPrice: 37000,
      demandWeight: 0.35,
    },
    {
      id: "beras5kg",
      name: "Beras 5kg",
      category: "Sembako",
      costPrice: 58000,
      sellingPrice: 65000,
      demandWeight: 0.35,
    },
    {
      id: "kopi",
      name: "Kopi Sachet",
      category: "Minuman",
      costPrice: 1100,
      sellingPrice: 2000,
      demandWeight: 0.6,
    },
  ];
}

function buildDemoWarungs(): DemoWarung[] {
  return [
    { id: "w1", name: "Warung Sumber Rejeki", city: "Bekasi" },
    { id: "w2", name: "Toko Makmur Jaya", city: "Bandung" },
    { id: "w3", name: "Warung Berkah Abadi", city: "Surabaya" },
  ];
}

function buildSeedStocks(rng: () => number, warungs: DemoWarung[], products: DemoProduct[]) {
  const stocks: DemoState["stocks"] = {};
  for (const w of warungs) {
    stocks[w.id] = {};
    for (const p of products) {
      const baseline = p.id === "telur" || p.id === "beras5kg" ? 18 : p.id === "aqua600" ? 60 : 45;
      const jitter = 1 + (rng() - 0.5) * 0.35;
      const value = Math.round(baseline * jitter);
      stocks[w.id][p.id] = Math.max(0, value);
    }
  }
  return stocks;
}

function buildInitialDaily(rng: () => number) {
  const points: DemoDailyPoint[] = [];
  const now = new Date();
  // last 30 days ending today
  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const date = ymd(d);
    // generate revenue trend with mild seasonality
    const base = 550_000 + (DAYS_BACK - i) * 8_500;
    const seasonal = Math.sin((DAYS_BACK - i) / 3) * 55_000;
    const noise = (rng() - 0.5) * 90_000;
    const revenue = Math.max(120_000, Math.round(base + seasonal + noise));
    const profitMargin = 0.32 + (rng() - 0.5) * 0.05;
    const profit = Math.round(revenue * profitMargin);
    points.push({ date, revenue, profit });
  }
  return points;
}

function computeTopProductTodayByWarung(state: DemoState) {
  // derive from recent transactions (today only)
  const byWarung: Record<string, Record<string, number>> = {};
  const today = todayDate();
  for (const w of state.warungs) byWarung[w.id] = {};

  for (const tx of state.transactions) {
    if (tx.createdAt.slice(0, 10) !== today) continue;
    const wMap = byWarung[tx.warungId];
    for (const it of tx.items) {
      wMap[it.productId] = (wMap[it.productId] ?? 0) + it.quantity;
    }
  }

  const result: DemoState["todayTopProductByWarung"] = {};
  for (const w of state.warungs) {
    const prodMap = byWarung[w.id];
    const entries = Object.entries(prodMap);
    if (!entries.length) {
      result[w.id] = { productId: state.products[0].id, quantity: 0 };
      continue;
    }
    entries.sort((a, b) => b[1] - a[1]);
    result[w.id] = { productId: entries[0][0], quantity: entries[0][1] };
  }
  return result;
}

function makeId(prefix: string, seedInt: number) {
  return `${prefix}_${seedInt.toString(16)}_${Math.floor(Date.now() / 1000).toString(16)}`;
}

export function buildInitialDemoState(seed = 42): DemoState {
  const rng = mulberry32(seed);
  const warungs = buildDemoWarungs();
  const products = buildSeedProducts();

  const stocks = buildSeedStocks(rng, warungs, products);
  const daily = buildInitialDaily(rng);

  // Create a handful of "today" transactions so the UI has something immediately.
  const today = new Date();
  const txCount = 8 + Math.floor(rng() * 6);
  const transactions: DemoTransaction[] = [];

  for (let i = 0; i < txCount; i++) {
    const warung = pickWeighted(rng, warungs.map((w) => ({ value: w, weight: 1 })));
    const candidateProducts = products.map((p) => {
      const stock = stocks[warung.id][p.id] ?? 0;
      const stockBoost = stock > 0 ? 1 : 0;
      const lowBoost = stock > 0 && stock <= LOW_STOCK_THRESHOLD ? 1.35 : 1;
      return { value: p, weight: p.demandWeight * stockBoost * lowBoost };
    });
    const p = pickWeighted(rng, candidateProducts);
    const stock = stocks[warung.id][p.id] ?? 0;
    if (stock <= 0) continue;

    const qtyMax = p.id === "telur" || p.id === "beras5kg" ? 1 : p.id === "aqua600" ? 6 : 5;
    const qty = Math.max(1, Math.min(stock, 1 + Math.floor(rng() * qtyMax)));

    const items: DemoTransactionItem[] = [
      {
        productId: p.id,
        productName: p.name,
        quantity: qty,
        price: p.sellingPrice,
        cost: p.costPrice,
      },
    ];

    const total = computeTotalForItems(items);
    const profit = computeProfitForItems(items);

    // decrease stock
    stocks[warung.id][p.id] = Math.max(0, stock - qty);

    const createdAt = new Date(today.getTime() - (txCount - i) * (2 * 60 * 1000) - Math.floor(rng() * 60 * 1000)).toISOString();
    transactions.push({
      id: makeId("tx", i + 1),
      warungId: warung.id,
      createdAt,
      items,
      total,
      profit,
    });
  }

  // Adjust today's daily revenue/profit based on generated txs.
  const todayPoint = daily[daily.length - 1];
  const todayRevenue = transactions.reduce((acc, tx) => acc + tx.total, 0);
  const todayProfit = transactions.reduce((acc, tx) => acc + tx.profit, 0);
  daily[daily.length - 1] = { ...todayPoint, revenue: Math.round(todayPoint.revenue * 0.55 + todayRevenue), profit: Math.round(todayPoint.profit * 0.55 + todayProfit) };

  const loans: DemoLoanSnapshot[] = [];
  const payments: DemoPayment[] = [];
  const supplierProducts: DemoSupplierProduct[] = [
    { id: "s_indomie", name: "Indomie Goreng", category: "Mie Instan", supplierName: "Distribusi Rakyat", price: 2500, minOrderQty: 20 },
    { id: "s_aqua600", name: "Aqua 600ml", category: "Minuman", supplierName: "Sumber Air Sehat", price: 5600, minOrderQty: 24 },
    { id: "s_telur", name: "Telur (per kg)", category: "Sembako", supplierName: "Pasar Grosir Utama", price: 33000, minOrderQty: 2 },
    { id: "s_beras5kg", name: "Beras 5kg", category: "Sembako", supplierName: "PT Berkah Panen", price: 59000, minOrderQty: 3 },
    { id: "s_kopi", name: "Kopi Sachet", category: "Minuman", supplierName: "Kopi Nusantara", price: 1200, minOrderQty: 50 },
  ];

  const restockOrders: DemoRestockOrder[] = [];

  // Initialize loans based on daily points
  for (const w of warungs) {
    const last7 = daily.slice(-7);
    const prev7 = daily.slice(-14, -7);
    const revenue7 = last7.reduce((acc, d) => acc + d.revenue, 0) / 7;
    const revenuePrev = prev7.reduce((acc, d) => acc + d.revenue, 0) / 7;
    const growthRate = revenuePrev > 0 ? (revenue7 - revenuePrev) / revenuePrev : 0.12;

    // payment behavior: initial simulate onTime
    const onTimeRepaymentRate = 0.86;
    const transactionCount = Math.max(6, Math.round((last7[last7.length - 1].revenue / 180_000) * (0.55 + rng() * 0.6)));

    const scored = computeLoanScore({
      avgDailyRevenue: revenue7,
      transactionCount,
      growthRate,
      onTimeRepaymentRate,
    });
    const tenorDays: 7 | 14 | 30 = scored.riskLevel === "low" ? 30 : scored.riskLevel === "medium" ? 14 : 7;
    const interestRate = computeInterestRate(scored.riskLevel, tenorDays);
    const eligible = scored.approved;
    loans.push({
      warungId: w.id,
      score: scored.score,
      riskLevel: scored.riskLevel,
      suggestedAmount: scored.suggestedAmount,
      tenorDays,
      interestRate,
      eligible,
    });
  }

  const insights: DemoInsight[] = [
    {
      id: makeId("ins", 1),
      createdAt: isoNow(),
      title: "Penjualan meningkat minggu ini",
      answer: "Penjualan gabungan naik sekitar 12 persen dibanding minggu lalu. Indomie dan Aqua memberi kontribusi terbesar.",
    },
    {
      id: makeId("ins", 2),
      createdAt: isoNow(),
      title: "Produk paling laku",
      answer: "Indomie Goreng terlihat paling sering terjual hari ini. Jika stok turun lagi, pertimbangkan restock lebih awal.",
    },
    {
      id: makeId("ins", 3),
      createdAt: isoNow(),
      title: "Stok Aqua hampir habis",
      answer: "Untuk beberapa warung, stok Aqua 600ml sudah mendekati ambang rendah. Stok hampir habis bukan berarti penjualan berhenti, tapi margin bisa ikut turun karena keterlambatan restock.",
    },
  ];

  const activity: DemoActivity[] = [
    {
      id: makeId("act", 1),
      createdAt: isoNow(),
      kind: "ai_insight",
      message: "Insight diperbarui. Penjualan minggu ini menunjukkan tren naik.",
    },
    {
      id: makeId("act", 2),
      createdAt: isoNow(),
      kind: "sales",
      message: "Transaksi baru masuk. Stok beberapa produk mulai menurun.",
    },
  ];

  const state: DemoState = {
    demoModeEnabled: true,
    warungs,
    products,
    stocks,
    daily,
    transactions,
    payments,
    loans,
    supplierProducts,
    restockOrders,
    insights,
    activity,
    todayTopProductByWarung: {},
  };

  state.todayTopProductByWarung = computeTopProductTodayByWarung(state);
  return state;
}

export type SimulationTickResult = {
  state: DemoState;
};

export function simulateTick(prev: DemoState, seed = 1337): SimulationTickResult {
  // deterministic-ish per tick using seed and time slice
  const timeSeed = Math.floor(Date.now() / 3000);
  const rng = mulberry32(seed + timeSeed);

  const state: DemoState = JSON.parse(JSON.stringify(prev));

  // Settle pending supplier restock orders.
  const supplierToProductId: Record<string, string> = {
    s_indomie: "indomie",
    s_aqua600: "aqua600",
    s_telur: "telur",
    s_beras5kg: "beras5kg",
    s_kopi: "kopi",
  };

  const restockSettleMs = 9000;
  const now = Date.now();
  const pendingRestocks = state.restockOrders.filter((o) => o.status === "pending");
  for (const order of pendingRestocks) {
    const ageMs = now - new Date(order.createdAt).getTime();
    if (ageMs < restockSettleMs) continue;
    const productId = supplierToProductId[order.supplierProductId];
    if (!productId) continue;

    const current = state.stocks[order.warungId][productId] ?? 0;
    state.stocks[order.warungId][productId] = current + order.quantity;
    order.status = "completed";
    order.completedAt = isoNow();

    const supplierProd = state.supplierProducts.find((sp) => sp.id === order.supplierProductId);
    const productName =
      supplierProd?.name ?? state.products.find((p) => p.id === productId)?.name ?? productId;

    state.activity.unshift({
      id: makeId("act", Math.floor(rng() * 10_000)),
      createdAt: order.completedAt!,
      kind: "supplier_order",
      message: `Stok ditambah: ${productName} sebanyak ${order.quantity} di warung ${state.warungs.find((w) => w.id === order.warungId)?.name ?? order.warungId}.`,
    });
  }

  const warung = pickWeighted(rng, state.warungs.map((w) => ({ value: w, weight: 1 })));
  const lowStockProducts = state.products.filter((p) => (state.stocks[warung.id][p.id] ?? 0) > 0 && (state.stocks[warung.id][p.id] ?? 0) <= LOW_STOCK_THRESHOLD);

  const pool = state.products.map((p) => {
    const stock = state.stocks[warung.id][p.id] ?? 0;
    const stockBoost = stock > 0 ? 1 : 0;
    const lowBoost = stock > 0 && stock <= LOW_STOCK_THRESHOLD ? 1.45 : 1;
    const demandBoost = p.demandWeight;
    return { value: p, weight: stockBoost * demandBoost * lowBoost };
  });

  const product = lowStockProducts.length && rng() < 0.45
    ? pickWeighted(rng, lowStockProducts.map((p) => ({ value: p, weight: p.demandWeight })))
    : pickWeighted(rng, pool);

  const currentStock = state.stocks[warung.id][product.id] ?? 0;
  if (currentStock > 0) {
    const qtyMax = product.id === "telur" || product.id === "beras5kg" ? 1 : product.id === "aqua600" ? 6 : 5;
    const qty = clamp(1 + Math.floor(rng() * qtyMax), 1, Math.max(1, currentStock));

    const items: DemoTransactionItem[] = [
      {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: product.sellingPrice,
        cost: product.costPrice,
      },
    ];

    const total = computeTotalForItems(items);
    const profit = computeProfitForItems(items);

    state.stocks[warung.id][product.id] = Math.max(0, currentStock - qty);

    const createdAt = isoNow();
    state.transactions.unshift({
      id: makeId("tx", Math.floor(rng() * 10_000)),
      warungId: warung.id,
      createdAt,
      items,
      total,
      profit,
    });
    state.transactions = state.transactions.slice(0, 120);

    // update today's daily point
    const last = state.daily[state.daily.length - 1];
    state.daily[state.daily.length - 1] = {
      ...last,
      revenue: Math.round(last.revenue + total),
      profit: Math.round(last.profit + profit),
    };

    // payment pending -> paid after delay
    const payment: DemoPayment = {
      id: makeId("pay", Math.floor(rng() * 10_000)),
      warungId: warung.id,
      method: rng() < 0.55 ? "qris" : "va",
      reference: `DEMO-${Math.floor(rng() * 1_000_000)}`,
      amount: total,
      status: "pending",
      createdAt,
    };
    state.payments.unshift(payment);
    state.payments = state.payments.slice(0, 80);
    state.activity.unshift({
      id: makeId("act", Math.floor(rng() * 10_000)),
      createdAt,
      kind: "sales",
      message: `Transaksi masuk: ${product.name} ${qty} item di ${warung.name}.`,
    });
    state.activity.unshift({
      id: makeId("act", Math.floor(rng() * 10_000)),
      createdAt,
      kind: "payment_pending",
      message: `Pembayaran dibuat (status pending) untuk transaksi ${payment.reference}.`,
    });
  }

  // settle some pending payments
  const paymentsNow = Date.now();
  const settleCandidates = state.payments.filter((p) => p.status === "pending").slice(0, 8);
  for (const p of settleCandidates) {
    const ageMs = paymentsNow - new Date(p.createdAt).getTime();
    if (ageMs > 6000 && rng() < 0.42) {
      p.status = "paid";
      p.paidAt = isoNow();
      state.activity.unshift({
        id: makeId("act", Math.floor(rng() * 10_000)),
        createdAt: p.paidAt!,
        kind: "payment_paid",
        message: `Pembayaran berhasil: ${p.reference} sebesar Rp${Math.round(p.amount).toLocaleString("id-ID")}.`,
      });
    }
  }

  // stock low alerts (based on current stocks after the sale)
  const stockLowNow = state.products
    .map((prod) => ({ prod, stock: state.stocks[warung.id][prod.id] ?? 0 }))
    .filter((x) => x.stock > 0 && x.stock <= LOW_STOCK_THRESHOLD);

  if (stockLowNow.length && rng() < 0.35) {
    const pick = stockLowNow[Math.floor(rng() * stockLowNow.length)];
    state.activity.unshift({
      id: makeId("act", Math.floor(rng() * 10_000)),
      createdAt: isoNow(),
      kind: "stock_low",
      message: `Stok hampir habis: ${pick.prod.name} di ${warung.name} (sisa ${pick.stock}).`,
    });
    state.insights.unshift({
      id: makeId("ins", Math.floor(rng() * 10_000)),
      createdAt: isoNow(),
      title: "Stok hampir habis",
      answer: `Stok ${pick.prod.name} di ${warung.name} saat ini ${pick.stock}. Jika tidak restock dalam 1-2 hari, penjualan berpotensi menurun.`,
    });
    state.insights = state.insights.slice(0, 12);
  }

  // recompute loans occasionally
  if (rng() < 0.25) {
    for (const w of state.warungs) {
      const last7 = state.daily.slice(-7);
      const prev7 = state.daily.slice(-14, -7);
      const revenue7 = last7.reduce((acc, d) => acc + d.revenue, 0) / 7;
      const revenuePrev = prev7.reduce((acc, d) => acc + d.revenue, 0) / 7;
      const growthRate = revenuePrev > 0 ? (revenue7 - revenuePrev) / revenuePrev : 0.12;

      const txCount = state.transactions.filter((t) => t.warungId === w.id && t.createdAt.slice(0, 10) >= ymd(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).length;

      const paid = state.payments.filter((p) => p.warungId === w.id && p.status === "paid");
      const pending = state.payments.filter((p) => p.warungId === w.id && p.status === "pending");
      const onTimeRepaymentRate = paid.length ? clamp(0.82 + (paid.length - 2) * 0.02, 0.4, 0.98) : 0.7;

      const scored = computeLoanScore({
        avgDailyRevenue: revenue7,
        transactionCount: txCount || 10,
        growthRate,
        onTimeRepaymentRate,
      });

      const tenorDays: 7 | 14 | 30 = scored.riskLevel === "low" ? 30 : scored.riskLevel === "medium" ? 14 : 7;
      const interestRate = computeInterestRate(scored.riskLevel, tenorDays);
      const eligible = scored.approved;

      const idx = state.loans.findIndex((l) => l.warungId === w.id);
      if (idx >= 0) {
        state.loans[idx] = {
          warungId: w.id,
          score: scored.score,
          riskLevel: scored.riskLevel,
          suggestedAmount: scored.suggestedAmount,
          tenorDays,
          interestRate,
          eligible,
        };
      }

      if (pending.length < 3 && rng() < 0.3) {
        state.activity.unshift({
          id: makeId("act", Math.floor(rng() * 10_000)),
          createdAt: isoNow(),
          kind: "loan_update",
          message: `Skor kredit diperbarui untuk ${w.name}. Status: ${eligible ? "eligible" : "belum eligible"}.`,
        });
      }
    }
  }

  state.todayTopProductByWarung = computeTopProductTodayByWarung(state);

  // AI insights berbasis tren real-time (simulasi Claude)
  const dayIndex = state.daily.length - 1;
  const prevWeekIndex = Math.max(0, dayIndex - 7);
  const weekGrowth =
    prevWeekIndex === dayIndex ? 0 : (state.daily[dayIndex].revenue - state.daily[prevWeekIndex].revenue) / Math.max(1, state.daily[prevWeekIndex].revenue);

  const globalTop = (() => {
    const entries: Array<{ productId: string; qty: number }> = [];
    for (const w of state.warungs) {
      const top = state.todayTopProductByWarung[w.id];
      if (!top) continue;
      entries.push({ productId: top.productId, qty: top.quantity });
    }
    entries.sort((a, b) => b.qty - a.qty);
    return entries[0];
  })();

  const aqua = state.products.find((p) => p.id === "aqua600");
  const aquaLowNow = aqua
    ? state.warungs.some((w) => (state.stocks[w.id]?.[aqua.id] ?? 0) > 0 && (state.stocks[w.id]?.[aqua.id] ?? 0) <= LOW_STOCK_THRESHOLD)
    : false;

  if (rng() < 0.22) {
    if (aquaLowNow) {
      state.insights.unshift({
        id: makeId("ins", Math.floor(rng() * 10_000)),
        createdAt: isoNow(),
        title: "Stok Aqua hampir habis",
        answer:
          "Dalam simulasi saat ini, stok Aqua 600ml di beberapa warung sudah mendekati ambang rendah. Restock lebih awal biasanya membantu menjaga penjualan tetap stabil.",
      });
    } else if (globalTop?.productId === "indomie" && (globalTop.qty ?? 0) > 10) {
      state.insights.unshift({
        id: makeId("ins", Math.floor(rng() * 10_000)),
        createdAt: isoNow(),
        title: "Indomie menjadi produk paling laku",
        answer:
          "Berdasarkan akumulasi penjualan hari ini, Indomie Goreng adalah produk terlaris. Jika terjadi penurunan stok, margin berpotensi turun karena pelanggan mencari produk alternatif.",
      });
    } else if (weekGrowth > 0.1) {
      const pct = Math.round(weekGrowth * 100);
      state.insights.unshift({
        id: makeId("ins", Math.floor(rng() * 10_000)),
        createdAt: isoNow(),
        title: "Penjualan meningkat minggu ini",
        answer: `Dalam simulasi, penjualan gabungan meningkat sekitar ${pct} persen dibanding periode sebelumnya. Indikasi ini kuat untuk melanjutkan strategi stok sesuai permintaan.`,
      });
    }
  }

  state.insights = state.insights.slice(0, 12);
  return { state };
}

export function getDerivedExecutive(state: DemoState) {
  const totalGmv = state.daily[state.daily.length - 1]?.revenue ?? 0;
  const activeWarungs = state.warungs.length;
  const dayIndex = state.daily.length - 1;
  const prevIndex = Math.max(0, dayIndex - 7);
  const growthPct = prevIndex === dayIndex ? 0 : ((state.daily[dayIndex].revenue - state.daily[prevIndex].revenue) / Math.max(1, state.daily[prevIndex].revenue)) * 100;
  const dailyRevenueSeries = state.daily.slice(-14);
  return {
    totalGmv,
    activeWarungs,
    dailyRevenueSeries,
    growthPct,
  };
}

export function getWarungAlerts(state: DemoState, warungId: string) {
  const low: Array<{ productId: string; name: string; stock: number }> = [];
  for (const p of state.products) {
    const stock = state.stocks[warungId][p.id] ?? 0;
    if (stock > 0 && stock <= LOW_STOCK_THRESHOLD) {
      low.push({ productId: p.id, name: p.name, stock });
    }
  }
  low.sort((a, b) => a.stock - b.stock);
  return low;
}

export function getWarungTodaySales(state: DemoState, warungId: string) {
  const today = todayDate();
  const txs = state.transactions.filter((t) => t.warungId === warungId && t.createdAt.slice(0, 10) === today);
  const revenue = txs.reduce((acc, t) => acc + t.total, 0);
  const profit = txs.reduce((acc, t) => acc + t.profit, 0);
  const itemsByProduct: Record<string, number> = {};
  for (const tx of txs) for (const it of tx.items) itemsByProduct[it.productId] = (itemsByProduct[it.productId] ?? 0) + it.quantity;
  const topEntry = Object.entries(itemsByProduct).sort((a, b) => b[1] - a[1])[0];
  return {
    revenue,
    profit,
    topProductId: topEntry?.[0] ?? state.products[0].id,
    topQty: topEntry?.[1] ?? 0,
    txCount: txs.length,
  };
}

export function getPaymentStats(state: DemoState) {
  const paid = state.payments.filter((p) => p.status === "paid");
  const pending = state.payments.filter((p) => p.status === "pending");
  return { paid, pending };
}

