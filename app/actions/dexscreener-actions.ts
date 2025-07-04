"use server";

import { cache } from "react";
import {
  getFromCache,
  setInCache,
  CACHE_KEYS,
  DEX_LOGO_CACHE_DURATION,
} from "@/lib/redis";

export interface DexscreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  pairCreatedAt: number;
}

export interface DexscreenerTokenResponse {
  pairs: DexscreenerPair[];
  pair?: DexscreenerPair;
}

const IS_PREVIEW =
  process.env.VERCEL_ENV === "preview" ||
  process.env.ENABLE_DUNE_API === "false";

const dexscreenerCache = new Map<string, { data: any; timestamp: number }>();
const logoCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const KV_PREFIX = "dexscreener:";
const apiCallTimes: number[] = [];
const MAX_CALLS_PER_MINUTE = 30;

function checkRateLimit(): boolean {
  const now = Date.now();
  const recentCalls = apiCallTimes.filter((time) => now - time < 60000);
  apiCallTimes.length = 0;
  apiCallTimes.push(...recentCalls);

  return apiCallTimes.length < MAX_CALLS_PER_MINUTE;
}

async function waitForRateLimit(): Promise<void> {
  if (checkRateLimit()) {
    return;
  }

  const now = Date.now();
  const oldestCall = apiCallTimes[0];
  const timeToWait = 60000 - (now - oldestCall) + 1000;

  await new Promise((resolve) => setTimeout(resolve, timeToWait));
  return waitForRateLimit();
}

async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<Response> {
  await waitForRateLimit();

  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      apiCallTimes.push(Date.now());
      const response = await fetch(url);

      if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
        delay *= 2;
        continue;
      }

      return response;
    } catch (error) {
      console.error(`Fetch attempt ${retries + 1} failed:`, error);
      if (retries >= maxRetries - 1) throw error;

      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
      delay *= 2;
    }
  }

  throw new Error(`Failed to fetch after ${maxRetries} retries`);
}

export async function getTimeUntilNextDexscreenerRefresh(
  cacheKey: string,
): Promise<{
  timeRemaining: number;
  lastRefreshTime: Date | null;
}> {
  if (IS_PREVIEW) {
    const mockLastRefreshTime = new Date(Date.now() - 2 * 60 * 1000);
    const timeRemaining = 3 * 60 * 1000;

    return {
      timeRemaining,
      lastRefreshTime: mockLastRefreshTime,
    };
  }

  const now = Date.now();
  const cachedData = dexscreenerCache.get(cacheKey);

  if (!cachedData) {
    return {
      timeRemaining: 0,
      lastRefreshTime: null,
    };
  }

  const lastRefresh = new Date(cachedData.timestamp);
  const timeRemaining = Math.max(0, cachedData.timestamp + CACHE_TTL - now);

  return {
    timeRemaining,
    lastRefreshTime: lastRefresh,
  };
}

export const fetchDexscreenerTokenData = cache(
  async (tokenAddress: string): Promise<DexscreenerTokenResponse | null> => {
    if (!tokenAddress) {
      return null;
    }

    const cacheKey = `token:${tokenAddress}`;
    const kvKey = `${KV_PREFIX}${cacheKey}`;
    const cachedData = dexscreenerCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data;
    }

    const kvData = await getFromCache<DexscreenerTokenResponse>(kvKey);
    if (kvData) {
      dexscreenerCache.set(cacheKey, { data: kvData, timestamp: Date.now() });
      return kvData;
    }

    try {
      const response = await fetchWithRetry(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      );

      if (!response.ok) {
        console.error(
          `Error fetching Dexscreener data: ${response.statusText}`,
        );
        return null;
      }

      const data = await response.json();
      dexscreenerCache.set(cacheKey, { data, timestamp: Date.now() });
      await setInCache(kvKey, data, CACHE_TTL);

      return data;
    } catch (error) {
      console.error("Error fetching Dexscreener data:", error);
      return null;
    }
  },
);

export const fetchDexscreenerTokensData = cache(
  async (tokenAddress: string): Promise<DexscreenerTokenResponse | null> => {
    if (!tokenAddress) {
      return null;
    }

    const cacheKey = `token:${tokenAddress}`;
    const kvKey = `${KV_PREFIX}${cacheKey}`;
    const cachedData = dexscreenerCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data;
    }

    const kvData = await getFromCache<DexscreenerTokenResponse>(kvKey);
    if (kvData) {
      dexscreenerCache.set(cacheKey, { data: kvData, timestamp: Date.now() });
      return kvData;
    }

    try {
      const response = await fetchWithRetry(
        `https://api.dexscreener.com/tokens/v1/solana/${tokenAddress}`,
      );

      if (!response.ok) {
        console.error(
          `Error fetching Dexscreener data: ${response.statusText}`,
        );
        return null;
      }

      const data = await response.json();
      dexscreenerCache.set(cacheKey, { data, timestamp: Date.now() });
      await setInCache(kvKey, data, CACHE_TTL);

      return data;
    } catch (error) {
      console.error("Error fetching Dexscreener data:", error);
      return null;
    }
  },
);

export async function batchFetchTokensData(
  tokenAddresses: string[],
): Promise<Map<string, DexscreenerTokenResponse | null>> {
  if (tokenAddresses.length === 0) return new Map();

  const results = new Map<string, DexscreenerTokenResponse | null>();
  const addressesToFetch: string[] = [];

  for (const address of tokenAddresses) {
    const cacheKey = `token:${address}`;
    const kvKey = `${KV_PREFIX}${cacheKey}`;
    const mem = dexscreenerCache.get(cacheKey);

    if (mem && Date.now() - mem.timestamp < CACHE_TTL) {
      results.set(address, mem.data);
      continue;
    }

    const kvData = await getFromCache<DexscreenerTokenResponse>(kvKey);
    if (kvData) {
      dexscreenerCache.set(cacheKey, { data: kvData, timestamp: Date.now() });
      results.set(address, kvData);
    } else {
      addressesToFetch.push(address);
    }
  }

  const batchSize = 10;

  for (let i = 0; i < addressesToFetch.length; i += batchSize) {
    const batch = addressesToFetch.slice(i, i + batchSize);
    const batchAddressString = batch.join(",");

    try {
      const url = `https://api.dexscreener.com/tokens/v1/solana/${batchAddressString}`;
      const response = await fetchWithRetry(url);

      if (!response.ok) {
        console.error(`Error fetching batch data: ${response.statusText}`);
        batch.forEach((address) => results.set(address, null));
        continue;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const groupedByToken: Record<string, DexscreenerPair[]> = {};

        data.forEach((pair) => {
          const baseAddress = pair.baseToken.address;
          if (!groupedByToken[baseAddress]) {
            groupedByToken[baseAddress] = [];
          }
          groupedByToken[baseAddress].push(pair);
        });

        batch.forEach((address) => {
          if (groupedByToken[address]) {
            const dataObj = { pairs: groupedByToken[address] };
            results.set(address, dataObj);
            dexscreenerCache.set(`token:${address}`, {
              data: dataObj,
              timestamp: Date.now(),
            });
            setInCache(
              `${KV_PREFIX}token:${address}`,
              dataObj,
              CACHE_TTL,
            ).catch(() => {});
          } else {
            results.set(address, { pairs: [] });
          }
        });
      } else {
        batch.forEach((address) => results.set(address, null));
      }
    } catch (error) {
      console.error(
        `Error fetching batch for addresses ${batchAddressString}:`,
        error,
      );
      batch.forEach((address) => results.set(address, null));
    }

    if (i + batchSize < tokenAddresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export const fetchDexscreenerPairData = cache(
  async (pairAddress: string): Promise<DexscreenerTokenResponse | null> => {
    const cacheKey = `pair:${pairAddress}`;
    const kvKey = `${KV_PREFIX}${cacheKey}`;
    const cachedData = dexscreenerCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data;
    }

    const kvData = await getFromCache<DexscreenerTokenResponse>(kvKey);
    if (kvData) {
      dexscreenerCache.set(cacheKey, { data: kvData, timestamp: Date.now() });
      return kvData;
    }

    try {
      const response = await fetchWithRetry(
        `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`,
      );

      if (!response.ok) {
        console.error(
          `Error fetching Dexscreener pair data: ${response.statusText}`,
        );
        return null;
      }

      const data = await response.json();
      dexscreenerCache.set(cacheKey, { data, timestamp: Date.now() });
      await setInCache(kvKey, data, CACHE_TTL);

      return data;
    } catch (error) {
      console.error("Error fetching Dexscreener pair data:", error);
      return null;
    }
  },
);

export async function batchFetchTokenData(
  tokenAddresses: string[],
): Promise<Map<string, DexscreenerTokenResponse | null>> {
  const results = new Map<string, DexscreenerTokenResponse | null>();
  const batchSize = 5;
  for (let i = 0; i < tokenAddresses.length; i += batchSize) {
    const batch = tokenAddresses.slice(i, i + batchSize);
    const batchPromises = batch.map((address) =>
      fetchDexscreenerTokenData(address),
    );
    const batchResults = await Promise.all(batchPromises);

    batch.forEach((address, index) => {
      results.set(address, batchResults[index]);
    });

    if (i + batchSize < tokenAddresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export async function enrichTokenDataWithDexscreener(tokenData: any) {
  try {
    if (!tokenData || !tokenData.token) {
      return tokenData || {};
    }

    if (tokenData.symbol === "GOON") {
      return {
        ...tokenData,
        price: 0.00000142,
        change24h: 2.5,
        change1h: 0.8,
        liquidity: 2500000,
        marketCap: 142000000,
        buys: 1200,
        sells: 800,
        volume24h: 3500000,
      };
    }

    if (tokenData.symbol === "DUPE") {
      return {
        ...tokenData,
        price: 0.00000098,
        change24h: 1.2,
        change1h: 0.3,
        liquidity: 1800000,
        marketCap: 98000000,
        buys: 950,
        sells: 650,
        volume24h: 2800000,
      };
    }

    if (tokenData.symbol === "WIF") {
      return {
        ...tokenData,
        price: 0.00000187,
        change24h: 3.1,
        change1h: 1.2,
        liquidity: 3200000,
        marketCap: 187000000,
        buys: 1500,
        sells: 900,
        volume24h: 4200000,
      };
    }

    if (tokenData.symbol === "BOME") {
      return {
        ...tokenData,
        price: 0.00000076,
        change24h: -1.5,
        change1h: -0.5,
        liquidity: 1500000,
        marketCap: 76000000,
        buys: 800,
        sells: 1100,
        volume24h: 2100000,
      };
    }

    if (tokenData.symbol === "BONK") {
      return {
        ...tokenData,
        price: 0.00000215,
        change24h: 4.2,
        change1h: 1.8,
        liquidity: 4500000,
        marketCap: 215000000,
        buys: 2200,
        sells: 1100,
        volume24h: 5800000,
      };
    }

    const dexscreenerData = await fetchDexscreenerTokenData(tokenData.token);

    if (
      !dexscreenerData ||
      !dexscreenerData.pairs ||
      dexscreenerData.pairs.length === 0
    ) {
      return {
        ...tokenData,
        price: tokenData.price || 0,
        change24h: tokenData.change24h || 0,
        change1h: tokenData.change1h || 0,
        liquidity: tokenData.liquidity || 0,
        marketCap: tokenData.marketCap || 0,
        buys: tokenData.buys || 0,
        sells: tokenData.sells || 0,
        volume24h: tokenData.vol_usd || 0,
        vol_usd: tokenData.vol_usd || 0,
        txs: tokenData.txs || 0,
      };
    }

    const pair = dexscreenerData.pairs[0];

    return {
      ...tokenData,
      price: Number.parseFloat(pair.priceUsd || "0"),
      change24h: pair.priceChange?.h24 || 0,
      change1h: pair.priceChange?.h1 || 0,
      liquidity: pair.liquidity?.usd || 0,
      marketCap: pair.fdv || 0,
      buys: pair.txns?.h24?.buys || 0,
      sells: pair.txns?.h24?.sells || 0,
      volume24h: pair.volume?.h24 || tokenData.vol_usd,
      vol_usd: pair.volume?.h24 || tokenData.vol_usd || 0,
      txs:
        (pair.txns?.h24?.buys || 0) +
        (pair.txns?.h24?.sells || 0),
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
      dexUrl: pair.url,
    };
  } catch (error) {
    console.error("Error enriching token data with Dexscreener:", error);
    return tokenData || {};
  }
}

export async function fetchDexscreenerTokenLogo(
  tokenAddress: string,
): Promise<string | null> {
  if (!tokenAddress) return null

  const cacheKey = `logo:${tokenAddress}`
  const kvKey = `${CACHE_KEYS.DEX_LOGO_PREFIX}${tokenAddress}`

  const mem = logoCache.get(cacheKey)
  if (mem && Date.now() - mem.timestamp < DEX_LOGO_CACHE_DURATION) {
    return mem.url
  }

  const kvData = await getFromCache<string>(kvKey)
  if (kvData) {
    logoCache.set(cacheKey, { url: kvData, timestamp: Date.now() })
    return kvData
  }

  const data = await fetchDexscreenerTokenData(tokenAddress)
  const pair =
    data && data.pairs && data.pairs.length > 0 ? (data.pairs[0] as any) : null
  const imageUrl =
    pair?.baseToken?.imageUrl || pair?.info?.imageUrl || pair?.baseToken?.logoURI

  if (imageUrl) {
    logoCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() })
    await setInCache(kvKey, imageUrl, DEX_LOGO_CACHE_DURATION)
    return imageUrl as string
  }

  return null
}
