export async function fetchFoundersGuideHtml(): Promise<string> {
  const defaultUrl =
    "https://docs.google.com/document/d/1fZHrmJOpcOIDzgYCkrqJk0yp8LM9kYXRISdChOthPv8/export?format=html";
  const url = process.env.NEXT_PUBLIC_FOUNDERS_GUIDE_DOC_URL || defaultUrl;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch guide: ${res.statusText}`);
      return "<p>Failed to load guide.</p>";
    }
    return await res.text();
  } catch (error) {
    console.error("Error fetching founders guide:", error);
    return "<p>Failed to load guide.</p>";
  }
}
