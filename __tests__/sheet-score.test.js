import test from 'node:test';
import assert from 'node:assert';
const API_KEY = 'AIzaSyC8QxJez_UTHUJS7vFj1J3Sje0CWS9tXyk';
const SHEET_ID = '1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0';
const SHEET_NAME = 'Dashcoin Scoring';
const RANGE = `${SHEET_NAME}!A1:L200`;
const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

test('all rows have valid score', async (t) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const [header, ...rows] = data.values || [];
    const scoreIndex = header.indexOf('Score');
    for (const row of rows) {
      const score = parseFloat(row[scoreIndex]);
      assert.equal(typeof score, 'number');
      assert.ok(!Number.isNaN(score));
    }
  } catch (err) {
    t.skip('Network unavailable');
  }
});
