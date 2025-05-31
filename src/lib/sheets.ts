import type { Project } from "../types/Project";

export const range = "Dashcoin!A2:O"; // TODO: If columns grow, switch to header-driven parsing.

export function parseRow(row: any[]): Project {
  return {
    creatorWallet: row[12] ?? null,
    creatorENS: row[13] ?? null,
    walletComment: row[14] ?? null,
  };
}

export async function fetchSheetData(sheetId: string, apiKey: string): Promise<Project[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const rows: any[][] = data.values || [];
  return rows.map(parseRow);
}
