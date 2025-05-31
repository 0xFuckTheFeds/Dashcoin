export const gradeMaps = {
  default: {
    '2': 2,
    '1': 1,
    '0': 0,
    2: 2,
    1: 1,
    0: 0,
    Yes: 2,
    No: 1,
    Unknown: 0,
    '': 0,
  },
  'Time Commitment': {
    'Full-time': 2,
    'Part-time / side-project': 1,
    Unknown: 0,
    '': 0,
  },
  'Funding Status': {
    'VC / institutional investors': 2,
    'Angel Investors': 1,
    Bootstrapped: 1,
    Unknown: 0,
    '': 0,
  },
  'Product Maturity': {
    'Live product': 2,
    'MVP / Beta': 1,
    'Concept only (white-paper / roadmap)': 1,
    Unknown: 0,
    '': 0,
  },
};

export function valueToScore(value, map = gradeMaps.default) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return value;
  }
  const key = value.toString().trim();
  if (map && Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key];
  }
  if (Object.prototype.hasOwnProperty.call(gradeMaps.default, key)) {
    return gradeMaps.default[key];
  }
  const num = parseInt(key, 10);
  return isNaN(num) ? 0 : num;
}

export function computeScoreFallback(entry) {
  if (!entry) return 0;
  const fields = [
    'Team Doxxed',
    'Twitter Activity Level',
    'Time Commitment',
    'Prior Founder Experience',
    'Product Maturity',
    'Funding Status',
    'Token-Product Integration Depth',
    'Social Reach & Engagement Index',
  ];

  let total = 0;
  fields.forEach(label => {
    const raw = entry[label];
    const map = gradeMaps[label] || gradeMaps.default;
    total += valueToScore(raw, map);
  });
  const score = Math.round((total / (fields.length * 2)) * 100);
  return score;
}
