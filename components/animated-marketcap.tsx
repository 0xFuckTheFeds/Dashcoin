"use client";
import { useMemo } from "react";

interface AnimatedMarketCapProps {
  value: number;
  decimals?: number; // default 0 decimals
}

export default function AnimatedMarketCap({ value, decimals = 0 }: AnimatedMarketCapProps) {
  const displayValue = value;
  const formatter = useMemo(() =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }), [decimals]);

  return <span>{formatter.format(displayValue)}</span>;
}
