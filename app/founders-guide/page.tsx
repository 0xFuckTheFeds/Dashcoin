import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founders Guide | Dashcoin Research",
};

const GUIDE_URL = process.env.NEXT_PUBLIC_FOUNDERS_GUIDE_URL || "";

export default function FoundersGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        <h1 className="dashcoin-text text-3xl text-dashYellow mb-2">Founders Guide</h1>
        <div className="flex-1 min-h-[60vh] bg-white rounded-md overflow-hidden shadow">
          {GUIDE_URL ? (
            <iframe
              src={GUIDE_URL}
              title="Founders Guide"
              className="w-full h-full border-0"
            />
          ) : (
            <p className="dashcoin-text text-dashYellow-light">
              Guide URL not configured.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

