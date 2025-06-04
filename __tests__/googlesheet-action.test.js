import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchTokenResearch } from '../app/actions/googlesheet-action'

const sample = {
  values: [
    [
      'Project',
      'Score',
      'Team Doxxed',
      'Twitter Activity Level',
      'Time Commitment',
      'Prior Founder Experience',
      'Product Maturity',
      'Funding Status',
      'Token-Product Integration Depth',
      'Social Reach & Engagement Index',
      'Data Integration',
    ],
    [
      'ABC',
      '80',
      'Yes',
      'No',
      'Unknown',
      'Yes',
      'No',
      'Yes',
      'Unknown',
      'No',
      'Yes',
    ],
  ],
}

test('fetchTokenResearch parses sheet data', async () => {
  const originalFetch = global.fetch
  global.fetch = async () => ({ json: async () => sample })
  const res = await fetchTokenResearch()
  global.fetch = originalFetch
  assert.equal(res.length, 1)
  const token = res[0]
  assert.equal(token.symbol, 'ABC')
  assert.equal(token['Team Doxxed'], 'Yes')
  assert.equal(token['Data Integration'], 'Yes')
})
