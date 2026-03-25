import { DemoSimProvider } from "@/components/demo/demo-sim-provider";
import { DemoAdminPage } from "@/components/demo/demo-admin-page";

export const dynamic = "force-dynamic";

export default function DemoAdminRoute() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <DemoSimProvider>
        <DemoAdminPage />
      </DemoSimProvider>
    </main>
  );
}

