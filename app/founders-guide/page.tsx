import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founders Guide | Dashcoin Research",
};

const DEFAULT_GUIDE_URL =
  "https://docs.google.com/document/d/1fZHrmJOpcOIDzgYCkrqJk0yp8LM9kYXRISdChOthPv8/export?format=html";

const GUIDE_URL =
  process.env.NEXT_PUBLIC_FOUNDERS_GUIDE_DOC_URL || DEFAULT_GUIDE_URL;

async function fetchGuideHtml(): Promise<string> {
  try {
    const res = await fetch(GUIDE_URL, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`Failed to fetch guide: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } catch (error) {
    console.error("Error fetching guide", error);
    return "<p>Unable to load guide.</p>";
  }
}

export default async function FoundersGuidePage() {
  const guideHtml = await fetchGuideHtml();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        <h1 className="dashcoin-text text-3xl text-dashYellow mb-2">Founders Guide</h1>
        <article
          className="founders-guide prose prose-invert mx-auto"
          dangerouslySetInnerHTML={{ __html: guideHtml }}
        />
      </main>
    </div>
  );
}
