"use client";
import { useState, useEffect, useMemo } from "react";

interface AnimatedMarketCapProps {
  value: number;
  decimals?: number; // default 0 decimals
}

export default function AnimatedMarketCap({ value, decimals = 0 }: AnimatedMarketCapProps) {
  const [base, setBase] = useState(Math.floor(value / 10000) * 10000);
  const [digits, setDigits] = useState(value % 10000);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setBase(Math.floor(value / 10000) * 10000);
    setDigits(value % 10000);
  }, [value]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDigits(prev => {
        let next = prev + Math.floor(Math.random() * 2000) - 1000; // +/-1000
        if (next < 0) next += 10000;
        if (next >= 10000) next -= 10000;
        return next;
      });
      setFlash(true);
    }, 800);
    return () => clearInterval(interval);
  }, [base]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 150);
    return () => clearTimeout(t);
  }, [flash]);

  const displayValue = base + digits;
  const formatter = useMemo(() =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }), [decimals]);

  return <span className={flash ? "price-flash" : undefined}>{formatter.format(displayValue)}</span>;
}
