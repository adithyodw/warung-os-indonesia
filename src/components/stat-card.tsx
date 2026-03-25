import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
};

export function StatCard({ title, value, icon, hint }: Props) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-zinc-500">{title}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
