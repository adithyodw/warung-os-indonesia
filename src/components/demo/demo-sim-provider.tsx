"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  buildInitialDemoState,
  getDerivedExecutive,
  simulateTick,
  type DemoState,
  getPaymentStats,
  getWarungAlerts,
  getWarungTodaySales,
} from "@/lib/demo-portal/sim";

type DemoSimContextValue = {
  state: DemoState;
  derived: ReturnType<typeof getDerivedExecutive>;
  paymentsStats: ReturnType<typeof getPaymentStats>;
  activeWarungId: string;
  setActiveWarungId: (id: string) => void;
  reset: () => void;
  placeSupplierRestock: (warungId: string, supplierProductId: string, quantity: number) => void;
  // derived helpers for warung view
  getWarungAlerts: (warungId: string) => ReturnType<typeof getWarungAlerts>;
  getWarungTodaySales: (warungId: string) => ReturnType<typeof getWarungTodaySales>;
};

const DemoSimContext = createContext<DemoSimContextValue | null>(null);

export function useDemoSim() {
  const ctx = useContext(DemoSimContext);
  if (!ctx) throw new Error("useDemoSim must be used within DemoSimProvider");
  return ctx;
}

export function DemoSimProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => buildInitialDemoState(42));
  const [activeWarungId, setActiveWarungId] = useState<string>("w1");

  const derived = useMemo(() => getDerivedExecutive(state), [state]);
  const paymentsStats = useMemo(() => getPaymentStats(state), [state]);

  // Keep tick stable across renders.
  const tickSeedRef = useRef<number>(1337);
  const runningRef = useRef<boolean>(true);

  useEffect(() => {
    runningRef.current = true;
    const interval = window.setInterval(() => {
      if (!runningRef.current) return;
      setState((prev) => simulateTick(prev, tickSeedRef.current).state);
    }, 3500);

    return () => {
      runningRef.current = false;
      window.clearInterval(interval);
    };
  }, []);

  function reset() {
    runningRef.current = false;
    setState(buildInitialDemoState(42));
    setActiveWarungId("w1");
    // restart quickly for perceived "live" feeling
    window.setTimeout(() => {
      runningRef.current = true;
    }, 300);
  }

  function placeSupplierRestock(warungId: string, supplierProductId: string, quantity: number) {
    const q = Math.max(1, Math.round(quantity));
    setState((prev) => {
      const id = `ro_${Math.floor(Math.random() * 1e9).toString(16)}_${Date.now().toString(16)}`;
      const createdAt = new Date().toISOString();
      const next: DemoState = JSON.parse(JSON.stringify(prev));
      next.restockOrders.unshift({
        id,
        warungId,
        supplierProductId,
        quantity: q,
        status: "pending",
        createdAt,
      });
      next.restockOrders = next.restockOrders.slice(0, 40);
      next.activity.unshift({
        id: `act_${Math.floor(Math.random() * 1e9).toString(16)}_${Date.now().toString(16)}`,
        createdAt,
        kind: "supplier_order",
        message: `Order restock dibuat untuk ${supplierProductId} (qty ${q}) di warung ${next.warungs.find((w) => w.id === warungId)?.name ?? warungId}.`,
      });
      next.activity = next.activity.slice(0, 50);
      return next;
    });
  }

  const value = useMemo<DemoSimContextValue>(
    () => ({
      state,
      derived,
      paymentsStats,
      activeWarungId,
      setActiveWarungId,
      reset,
      placeSupplierRestock,
      getWarungAlerts: (warungId) => getWarungAlerts(state, warungId),
      getWarungTodaySales: (warungId) => getWarungTodaySales(state, warungId),
    }),
    [state, derived, paymentsStats, activeWarungId],
  );

  return <DemoSimContext.Provider value={value}>{children}</DemoSimContext.Provider>;
}

