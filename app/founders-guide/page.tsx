import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";
import { fetchFoundersGuideHtml } from "@/lib/founders-guide";

export const metadata: Metadata = {
  title: "Founders Guide | Dashcoin Research",
};

export default async function FoundersGuidePage() {
  const html = await fetchFoundersGuideHtml();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1">
        <h1 className="dashcoin-text text-dashYellow text-center text-4xl mb-4">
          Founder&apos;s Guide
        </h1>
        <article
          className="founders-guide prose prose-invert w-full mx-auto max-w-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}

