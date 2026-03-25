import { DemoSimProvider } from "@/components/demo/demo-sim-provider";
import { DemoPortalMain } from "@/components/demo/demo-portal-main";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <DemoSimProvider>
        <DemoPortalMain />
      </DemoSimProvider>
    </main>
  );
}

