const assert = require('assert')
const { computeScoreFallback } = require('../lib/score.js')

const sampleRow = {
  'Team Doxxed': 'Pseudonymous',
  'Twitter Activity Level': 'Medium',
  'Time Commitment': 'Part-time / side-project',
  'Prior Founder Experience': 'One prior startup',
  'Product Maturity': 'Live MVP',
  'Funding Status': 'Angel Investors',
  'Token-Product Integration Depth': 'Concept only (white-paper / roadmap)',
  'Social Reach & Engagement Index': 'High'
}

const score = computeScoreFallback(sampleRow)
assert.strictEqual(score, 38)
console.log('score fallback OK')
