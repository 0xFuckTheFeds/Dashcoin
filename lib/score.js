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
  'Team Doxxed': {
    'Legal Names': 2,
    Pseudonymous: 1,
    Unknown: 0,
    '': 0,
  },
  'Twitter Activity Level': {
    High: 2,
    Medium: 1,
    Low: 0,
    Unknown: 0,
    '': 0,
  },
  'Time Commitment': {
    'Full-time (≥ 35 hrs/wk)': 2,
    'Part-time / side-project': 1,
    Abandoned: 0,
    Unknown: 0,
    '': 0,
  },
  'Prior Founder Experience': {
    'Two or more prior startups': 2,
    'One prior startup': 1,
    None: 0,
    Unknown: 0,
    '': 0,
  },
  'Product Maturity': {
    'Revenue-positive / paying customers': 2,
    'Live MVP': 1,
    'Prototype / pre-alpha': 0,
    Unknown: 0,
    '': 0,
  },
  'Funding Status': {
    'Venture Backed': 2,
    'Angel Investors': 1,
    Bootstrapped: 0,
    Unknown: 0,
    '': 0,
  },
  'Token-Product Integration Depth': {
    'Fully live': 2,
    'Concept only (white-paper / roadmap)': 1,
    None: 0,
    Unknown: 0,
    '': 0,
  },
  'Social Reach & Engagement Index': {
    // Raw values from the Google Sheet
    'High ( ≥ 20k followers)': 2,
    'Medium (5k – 20k followers)': 1,
    'Low (< 5k followers)': 0,
    Unknown: 0,
    '': 0,
    // Short labels that sometimes appear in data
    High: 2,
    Medium: 1,
    Low: 0,
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
  const lowerKey = key.toLowerCase();
  if (map) {
    for (const [k, v] of Object.entries(map)) {
      if (k.toLowerCase() === lowerKey) return v;
    }
  }
  if (Object.prototype.hasOwnProperty.call(gradeMaps.default, key)) {
    return gradeMaps.default[key];
  }
  const defaultLowerEntries = Object.entries(gradeMaps.default);
  for (const [k, v] of defaultLowerEntries) {
    if (k.toLowerCase() === lowerKey) return v;
  }
  if (map === gradeMaps['Social Reach & Engagement Index']) {
    const match = key.replace(/[, ]/g, '').match(/(\d+(?:\.\d+)?)(k)?/i);
    if (match) {
      let count = parseFloat(match[1]);
      if (match[2]) count *= 1000;
      if (count >= 20000) return 2;
      if (count >= 5000) return 1;
      return 0;
    }
  }
  const num = parseInt(key, 10);
  return isNaN(num) ? 0 : num;
}

export function computeFounderScore(data) {
  if (!data) return 0;
  const traits = Object.keys(gradeMaps).filter(k => k !== 'default');
  let total = 0;
  for (const label of traits) {
    const raw = data[label];
    total += valueToScore(raw, gradeMaps[label]);
  }
  const max = traits.length * 2;
  return Math.round((total / max) * 100);
}
