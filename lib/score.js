const gradeMaps = {
  "Team Doxxed": {
    "Legal Names": 2,
    "Psudonymous": 1,
    "Pseudonymous": 1,
    "Unknown": 0,
  },
  "Twitter Activity Level": { High: 2, Medium: 1, Low: 0, Unknown: 0 },
  "Time Commitment": {
    "Full-time (≥ 35 hrs/wk)": 2,
    "Part-time / side-project": 0,
    Unknown: 0,
    Abandoned: 0,
  },
  "Prior Founder Experience": {
    "Two or more prior startups": 2,
    "One prior startup": 1,
    None: 0,
    Unknown: 0,
  },
  "Product Maturity": {
    "Revenue-positive / paying customers": 2,
    "Live MVP": 1,
    "Prototype / pre-alpha": 0,
    Unknown: 0,
  },
  "Funding Status": {
    "Venture Backed": 2,
    "Angel Investors": 0,
    Bootstrapped: 1,
    Unknown: 0,
  },
  "Token-Product Integration Depth": {
    "Fully live": 2,
    "Concept only (white-paper / roadmap)": 0,
    None: 0,
    Unknown: 0,
  },
  "Social Reach & Engagement Index": {
    High: 2,
    Medium: 1,
    Low: 0,
    Unknown: 0,
  },
};

function computeScoreFallback(row) {
  const raw =
    (gradeMaps["Team Doxxed"][row["Team Doxxed"]] ?? 0) +
    (gradeMaps["Twitter Activity Level"][row["Twitter Activity Level"]] ?? 0) +
    (gradeMaps["Time Commitment"][row["Time Commitment"]] ?? 0) +
    (gradeMaps["Prior Founder Experience"][row["Prior Founder Experience"]] ?? 0) +
    (gradeMaps["Product Maturity"][row["Product Maturity"]] ?? 0) +
    (gradeMaps["Funding Status"][row["Funding Status"]] ?? 0) +
    (gradeMaps["Token-Product Integration Depth"][row["Token-Product Integration Depth"]] ?? 0) +
    (/High/i.test(row["Social Reach & Engagement Index"]) ? 2 : /Medium/i.test(row["Social Reach & Engagement Index"]) ? 1 : 0);
  return Math.round((raw / 16) * 100);
}

module.exports = { gradeMaps, computeScoreFallback };
