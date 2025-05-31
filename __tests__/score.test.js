import assert from 'node:assert';
import { computeScoreFallback } from '../lib/score.js';

const sample = {
  'Team Doxxed': 'No',
  'Twitter Activity Level': 'Unknown',
  'Time Commitment': 'Part-time / side-project',
  'Prior Founder Experience': 'No',
  'Product Maturity': 'Concept only (white-paper / roadmap)',
  'Funding Status': 'Angel Investors',
  'Token-Product Integration Depth': 'No',
  'Social Reach & Engagement Index': 'Unknown',
};

const score = computeScoreFallback(sample);
assert.equal(score, 38);
