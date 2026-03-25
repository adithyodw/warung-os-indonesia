import { DemoSimProvider } from "@/components/demo/demo-sim-provider";
import { DemoPortalMain } from "@/components/demo/demo-portal-main";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <DemoSimProvider>
          <DemoPortalMain />
        </DemoSimProvider>
      </main>
    </div>
  );
}

