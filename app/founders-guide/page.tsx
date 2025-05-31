import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";
import { fetchFoundersGuideHtml } from "@/lib/fetchFoundersGuideHtml";

export const metadata: Metadata = {
  title: "Founders Guide | Dashcoin Research",
};

export default async function FoundersGuidePage() {
  const html = await fetchFoundersGuideHtml();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <h1 className="dashcoin-text text-3xl text-dashYellow text-center mb-4">
          Founder's Guide
        </h1>
        <article
          className="founders-guide"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}

