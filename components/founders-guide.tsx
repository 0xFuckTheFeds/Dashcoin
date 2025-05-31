"use client";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "./theme-toggle";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function FoundersGuide({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  // create slug from text
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  useEffect(() => {
    if (!contentRef.current) return;
    const nodes = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>("h1, h2, h3")
    );
    const list: Heading[] = nodes.map((node) => {
      let id = node.id;
      if (!id) {
        id = slugify(node.textContent || "");
        node.id = id;
      }
      return { id, text: node.textContent || "", level: parseInt(node.tagName[1]) };
    });
    setHeadings(list);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => nodes.forEach((n) => observer.unobserve(n));
  }, [html]);

  return (
    <div className="container mx-auto px-4 py-8 flex gap-8">
      <aside className="hidden lg:block w-64 sticky top-24 self-start">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-dashYellow">Contents</h2>
          <ThemeToggle />
        </div>
        <ul className="space-y-1 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={`pl-${(h.level - 1) * 4}`}>
              <a
                href={`#${h.id}`}
                className={
                  active === h.id
                    ? "text-dashYellow"
                    : "text-dashYellow-light hover:text-dashYellow"
                }
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      <article
        ref={contentRef}
        className="prose dark:prose-invert max-w-prose w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
