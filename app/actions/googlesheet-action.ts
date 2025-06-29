import { gradeMaps, valueToScore } from '@/lib/score'
import {
  getFromCache,
  setInCache,
  CACHE_KEYS,
  WALLET_CACHE_DURATION,
  setQueryLastRefreshTime,
} from '@/lib/redis'
import { richTextToHtml, extractHyperlink } from '@/lib/utils'

interface ResearchScoreData {
  symbol: string
  score: number | null
  "Token Demand"?: string
  "User Growth & Traction"?: string
  "Notable Supporters of the Project"?: string
  "Product Description"?: string
  "Founder History"?: string
  "Twitter Activity"?: string
  Summary?: string
  [key: string]: any
}

export async function fetchTokenResearch(): Promise<ResearchScoreData[]> {
  const API_KEY = 'AIzaSyC8QxJez_UTHUJS7vFj1J3Sje0CWS9tXyk';
  const SHEET_ID = '1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0';
  const SHEET_NAME = 'Dashcoin Scoring';
  const RANGE = `${SHEET_NAME}!A1:W200`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}&ranges=${RANGE}&includeGridData=true&fields=sheets.data.rowData.values(formattedValue,hyperlink,textFormatRuns)`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const rows = data.sheets?.[0]?.data?.[0]?.rowData || [];
    if (rows.length < 2) {
      console.warn('No data found in Google Sheet');
      return [];
    }

    const header = (rows[0].values || []).map((c: any) => c.formattedValue || '');
    const body = rows.slice(1);
    
    const canonicalMap: Record<string, string> = {
      'Startup Experience': 'Prior Founder Experience',
      'Project Has Some Virality / Popularity':
        'Social Reach & Engagement Index',
    };

    const structured = body.map((row: any) => {
      const entry: Record<string, any> = {};
      const cells = row.values || [];
      header.forEach((key: string, i: number) => {
        const trimmed = key.trim();
        const canonical = canonicalMap[trimmed] || trimmed;
        const cell = cells[i] || {};
        if (
          [
            'Token Demand',
            'User Growth & Traction',
            'Notable Supporters of the Project',
            'Product Description',
            'Founder History',
            'Twitter Activity',
            'Summary',
          ].includes(canonical)
        ) {
          entry[canonical] = richTextToHtml(cell);
        } else {
          entry[canonical] = cell.formattedValue || '';
        }
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
        'Token Demand',
        'User Growth & Traction',
        'Notable Supporters of the Project',
        'Product Description',
        'Founder History',
        'Twitter Activity',
        'Summary',
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
}

export async function fetchCreatorWalletLinks(): Promise<WalletLinkData[]> {
  const API_KEY = 'AIzaSyC8QxJez_UTHUJS7vFj1J3Sje0CWS9tXyk'
  const SHEET_ID = '1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0'
  const SHEET_NAME = 'Dashcoin Scoring'
  const RANGE = `${SHEET_NAME}!A1:W200`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}&ranges=${RANGE}&includeGridData=true&fields=sheets.data.rowData.values(formattedValue,hyperlink,textFormatRuns)`

  const cached = await getFromCache<WalletLinkData[]>(CACHE_KEYS.CREATOR_WALLETS)
  if (cached && cached.length > 0) {
    return cached
  }

  try {
    const response = await fetch(url)
    const data = await response.json()

    const rows = data.sheets?.[0]?.data?.[0]?.rowData || []
    if (rows.length < 2) {
      console.warn('No data found in Google Sheet')
      return []
    }

    const header = (rows[0].values || []).map((c: any) => c.formattedValue || '')
    const body = rows.slice(1)

    const structured = body.map((row: any) => {
      const entry: Record<string, any> = {}
      const cells = row.values || []
      header.forEach((key: string, i: number) => {
        const cell = cells[i] || {}
        entry[key.trim()] = cell.formattedValue || ''
        if (key.trim() === 'Wallet Link') {
          entry[key.trim()] = extractHyperlink(cell)
        }
        if (key.trim() === 'Twitter') {
          entry[key.trim()] = extractHyperlink(cell)
        }
      })
      return entry
    })

    const result = structured.map((entry: any) => {
      return {
        symbol: (entry['Project'] || '').toString().toUpperCase(),
        walletLink: entry['Wallet Link'] || '',
        walletActivity: entry['Wallet Comments'] || '',
        twitter: entry['Twitter'] || ''
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
