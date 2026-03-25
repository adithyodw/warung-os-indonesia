import { DemoSimProvider } from "@/components/demo/demo-sim-provider";
import { DemoAdminPage } from "@/components/demo/demo-admin-page";

export const dynamic = "force-dynamic";

export default function DemoAdminRoute() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <DemoSimProvider>
          <DemoAdminPage />
        </DemoSimProvider>
      </main>
    </div>
  );
}

