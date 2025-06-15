import { gradeMaps, valueToScore } from '@/lib/score'
import {
  getFromCache,
  setInCache,
  CACHE_KEYS,
  WALLET_CACHE_DURATION,
  setQueryLastRefreshTime,
} from '@/lib/redis'

interface ResearchScoreData {
  symbol: string
  score: number | null
  [key: string]: any
}

export async function fetchTokenResearch(): Promise<ResearchScoreData[]> {
  const API_KEY = 'AIzaSyC8QxJez_UTHUJS7vFj1J3Sje0CWS9tXyk';
  const SHEET_ID = '1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0';
  const SHEET_NAME = 'Dashcoin Scoring';
  const RANGE = `${SHEET_NAME}!A1:T200`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.values || data.values.length < 2) {
      console.warn('No data found in Google Sheet');
      return [];
    }

    const [header, ...rows] = data.values;
    
    const canonicalMap: Record<string, string> = {
      'Startup Experience': 'Prior Founder Experience',
      'Project Has Some Virality / Popularity':
        'Social Reach & Engagement Index',
    };

    const structured = rows.map((row: any) => {
      const entry: Record<string, any> = {};
      header.forEach((key: string, i: number) => {
        const trimmed = key.trim();
        const canonical = canonicalMap[trimmed] || trimmed;
        entry[canonical] = row[i] || '';
      });
      return entry;
    });

    return structured.map((entry: any) => {
      const explicit = entry['Score'] !== undefined && entry['Score'] !== ''
        ? parseFloat(entry['Score'])
        : NaN;
      let score = explicit;
      if (isNaN(score)) {
        const traits = Object.keys(gradeMaps).filter(k => k !== 'default');
        let total = 0;
        traits.forEach(label => {
          total += valueToScore(entry[label], gradeMaps[label]);
        });
        score = Math.round((total / (traits.length * 2)) * 100);
      }
      const result: Record<string, any> = {
        symbol: (entry['Project'] || '').toString().trim().toUpperCase(),
        score,
      };
      [
        'Team Doxxed',
        'Twitter Activity Level',
        'Time Commitment',
        'Prior Founder Experience',
        'Product Maturity',
        'Funding Status',
        'Token-Product Integration Depth',
        'Social Reach & Engagement Index',
      ].forEach(label => {
        result[label] = entry[label] ?? '';
      });
      return result as ResearchScoreData;
    });
  } catch (err) {
    console.error('Google Sheets API error:', err);
    return [];
  }
}

interface WalletLinkData {
  symbol: string
  walletLink: string
  walletActivity: string
  twitter: string
  linkedin: string
}

export async function fetchCreatorWalletLinks(): Promise<WalletLinkData[]> {
  const API_KEY = 'AIzaSyC8QxJez_UTHUJS7vFj1J3Sje0CWS9tXyk'
  const SHEET_ID = '1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0'
  const SHEET_NAME = 'Dashcoin Scoring'
  const RANGE = `${SHEET_NAME}!A1:T200`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`

  const cached = await getFromCache<WalletLinkData[]>(CACHE_KEYS.CREATOR_WALLETS)
  if (cached && cached.length > 0 && Object.prototype.hasOwnProperty.call(cached[0], 'linkedin')) {
    return cached
  }

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.values || data.values.length < 2) {
      console.warn('No data found in Google Sheet')
      return []
    }

    const [header, ...rows] = data.values

    const structured = rows.map((row: any) => {
      const entry: Record<string, any> = {}
      header.forEach((key: string, i: number) => {
        entry[key.trim()] = row[i] || ''
      })
      return entry
    })

    const result = structured.map((entry: any) => {
      const linkedinKey = Object.keys(entry).find(key => key.trim().toLowerCase() === 'linkedin')
      return {
        symbol: (entry['Project'] || '').toString().toUpperCase(),
        walletLink: entry['Wallet Link'] || '',
        walletActivity: entry['Wallet Comments'] || '',
        twitter: entry['Twitter'] || '',
        linkedin: linkedinKey ? entry[linkedinKey] || '' : ''
      }
    })
    await setInCache(CACHE_KEYS.CREATOR_WALLETS, result, WALLET_CACHE_DURATION)
    await setQueryLastRefreshTime(CACHE_KEYS.CREATOR_WALLETS_LAST_REFRESH)
    return result
  } catch (err) {
    console.error('Google Sheets API error:', err)
    return []
  }
}
