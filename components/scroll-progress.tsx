"use client";
import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const scroll = window.scrollY;
      const pct = total > 0 ? (scroll / total) * 100 : 0;
      setProgress(pct);
    };
    update();
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-dashGreen-light z-40">
      <div className="h-full bg-dashYellow" style={{ width: `${progress}%` }} />
    </div>
  );
}
