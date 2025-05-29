"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";

interface DocInfo {
  id: string;
  title: string;
  html?: string;
}

export default function ResearchPage() {
  const [docs, setDocs] = useState<DocInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/api/docs");
        const data = await res.json();
        setDocs(data);
        if (data.length && !selectedId) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load docs", err);
      }
    }
    loadDocs();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    async function loadDoc() {
      try {
        const res = await fetch(`/api/docs/${selectedId}`);
        const data = await res.json();
        setDocs(prev => prev.map(d => d.id === selectedId ? { ...d, html: data.html, title: data.title } : d));
      } catch (err) {
        console.error("Failed to load doc", err);
      }
    }
    loadDoc();
  }, [selectedId]);

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
  const active = docs.find(d => d.id === selectedId);

  return (
    <div className="min-h-screen bg-dashGreen-dark text-dashYellow-light">
      <Navbar dashcoinTradeLink="https://axiom.trade/t/fRfKGCriduzDwSudCwpL7ySCEiboNuryhZDVJtr1a1C/dashc" />
      <div className="container mx-auto flex flex-col md:flex-row gap-4 px-4">
        <aside className="md:w-1/5 w-full md:sticky top-4 h-fit">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 mb-4 rounded-md bg-dashGreen-light text-dashYellow"
          />
          <ul className="space-y-2">
            {filtered.map(doc => (
              <li key={doc.id}>
                <button
                  onClick={() => setSelectedId(doc.id)}
                  className={`text-left w-full px-2 py-1 rounded-md ${selectedId === doc.id ? 'bg-dashGreen-accent text-dashYellow' : 'hover:bg-dashGreen-light'}`}
                >
                  {doc.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="md:w-4/5 w-full prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: active?.html || '' }} />
      </div>
    </div>
  );
}
