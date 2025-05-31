import { Navbar } from "@/components/navbar";
import FoundersGuide from "@/components/founders-guide";
import ScrollProgress from "@/components/scroll-progress";

export const metadata = {
  title: "Believe Founder's Guide",
};

async function getGuideHtml() {
  const id = process.env.FOUNDERS_GUIDE_DOC_ID;
  if (!id) return null;
  try {
    const res = await fetch(
      `https://docs.google.com/document/d/${id}/export?format=html`
    );
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.error("Failed to fetch founders guide", err);
    return null;
  }
}

export default async function Page() {
  const html = await getGuideHtml();
  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollProgress />
      {html ? (
        <FoundersGuide html={html} />
      ) : (
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl mb-4 text-dashYellow">Founder's Guide</h1>
          <p className="text-dashYellow-light">
            Unable to load the guide at this time.
          </p>
        </div>
      )}
    </div>
  );
}
