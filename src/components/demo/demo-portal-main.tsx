"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import { ExecutiveDashboard } from "@/components/demo/executive-dashboard";
import { WarungDetail } from "@/components/demo/warung-detail";
import { AiInsightsPanel } from "@/components/demo/ai-insights-panel";
import { PaymentsSimulation } from "@/components/demo/payments-simulation";
import { LendingSimulation } from "@/components/demo/lending-simulation";
import { SupplierMarketplaceDemo } from "@/components/demo/supplier-marketplace-demo";
import { WhatsAppSimulation } from "@/components/demo/whatsapp-simulation";
import { ActivityFeed } from "@/components/demo/activity-feed";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useDemoSim } from "@/components/demo/demo-sim-provider";

export function DemoPortalMain() {
  const { reset } = useDemoSim();

  return (
    <div className="min-h-screen space-y-6">
      {/* Top header */}
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Live Demo Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
            Warung OS Indonesia
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Simulasi operasional warung Indonesia secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/demo/admin"
            className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Overview
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>

      <DemoBanner onReset={reset} />

      {/* Left + right grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <Section label="Executive Dashboard">
            <ExecutiveDashboard />
          </Section>
          <Section label="Warung Detail">
            <WarungDetail />
          </Section>
          <Section label="AI Insights">
            <AiInsightsPanel />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Section label="Pembayaran">
            <PaymentsSimulation />
          </Section>
          <Section label="Pembiayaan">
            <LendingSimulation />
          </Section>
          <Section label="Supplier Marketplace">
            <SupplierMarketplaceDemo />
          </Section>
          <Section label="WhatsApp Simulation">
            <WhatsAppSimulation />
          </Section>
        </div>
      </div>

      <Section label="Activity Feed">
        <ActivityFeed />
      </Section>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      {children}
    </div>
  );
}
