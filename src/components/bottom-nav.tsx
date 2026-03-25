"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ChartNoAxesCombined, HandCoins, Package, Wallet } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: ChartNoAxesCombined },
  { href: "/jualan", label: "Jualan", icon: HandCoins },
  { href: "/stok", label: "Stok", icon: Package },
  { href: "/pembayaran", label: "Bayar", icon: Wallet },
  { href: "/ai-chat", label: "AI", icon: Bot },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t bg-white/95 px-2 pb-4 pt-2 backdrop-blur">
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 text-xs font-medium ${
                  active ? "bg-green-100 text-green-700" : "text-zinc-500"
                }`}
              >
                <Icon className="mb-1 h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
