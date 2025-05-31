export async function fetchFoundersGuideHtml() {
  const url =
    process.env.NEXT_PUBLIC_FOUNDERS_GUIDE_DOC_URL ||
    'https://docs.google.com/document/d/1fZHrmJOpcOIDzgYCkrqJk0yp8LM9kYXRISdChOthPv8/export?format=html';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch guide');
    }
    return await res.text();
  } catch (err) {
    console.error(err);
    return '<p>Unable to load guide.</p>';
  }
}
