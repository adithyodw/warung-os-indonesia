export function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function getDemoUser() {
  return {
    id: "demo-user",
    email: "demo@demo.local",
    user_metadata: { name: "Admin Demo" },
  };
}

export function getDemoInsights() {
  return {
    totalPenjualanHariIni: 450000,
    totalUntungHariIni: 125000,
    produkTerlaris: "Indomie Goreng",
    jumlahProdukTerlaris: 18,
    stokMenipis: [
      { name: "Indomie Goreng", stock: 3 },
      { name: "Teh Botol", stock: 2 },
    ],
    notifikasi: [
      "Contoh notifikasi: stok hampir habis.",
      "Contoh notifikasi: penjualan hari ini lumayan.",
    ],
  };
}

export function getDemoAdminStats() {
  return {
    totalSales: 1250000,
    paidPayments: 800000,
    activeLoans: 2,
    pendingOrders: 3,
  };
}

