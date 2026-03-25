export type Product = {
  id: string;
  user_id: string;
  name: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  total: number;
  profit: number;
  created_at: string;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string | null;
  name_snapshot: string;
  quantity: number;
  price: number;
  cost: number;
  created_at: string;
};

export type InsightData = {
  totalPenjualanHariIni: number;
  totalUntungHariIni: number;
  produkTerlaris: string;
  jumlahProdukTerlaris: number;
  stokMenipis: Array<{ name: string; stock: number }>;
  notifikasi: string[];
};

export type WarungProfile = {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  city: string | null;
  created_at: string;
};

export type Loan = {
  id: string;
  user_id: string;
  warung_id: string;
  amount: number;
  tenor_days: number;
  interest_rate: number;
  score: number;
  risk_level: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "disbursed" | "completed";
  created_at: string;
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  name: string;
  category: string | null;
  price: number;
  min_order_qty: number;
  stock_available: number;
};
