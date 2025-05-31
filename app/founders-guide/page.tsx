import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founders Guide | Dashcoin Research",
};

const DEFAULT_GUIDE_URL =
  "https://docs.google.com/document/d/1fZHrmJOpcOIDzgYCkrqJk0yp8LM9kYXRISdChOthPv8/export?format=html";
const GUIDE_URL =
  process.env.NEXT_PUBLIC_FOUNDERS_GUIDE_DOC_URL || DEFAULT_GUIDE_URL;

async function fetchGuideHtml() {
  try {
    const res = await fetch(GUIDE_URL, { cache: "force-cache" });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export default async function FoundersGuidePage() {
  const guideHtml = await fetchGuideHtml();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        <h1 className="dashcoin-text text-3xl text-dashYellow mb-2">Founders Guide</h1>
        <article className="flex-1 min-h-[60vh] bg-dashGreen-dark rounded-md overflow-y-auto p-6 prose prose-invert text-dashYellow">
          {guideHtml ? (
            <div dangerouslySetInnerHTML={{ __html: guideHtml }} />
          ) : (
            <p className="dashcoin-text text-dashYellow-light">Guide not available.</p>
          )}
        </article>
      </main>
    </div>
  );
}

