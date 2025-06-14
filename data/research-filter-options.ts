export const researchFilterOptions: Record<string, string[]> = {
  "Team Doxxed": ["Legal Names", "Pseudonymous", "Unknown"],
  "Twitter Activity Level": ["High", "Medium", "Low", "Unknown"],
  "Time Commitment": [
    "Full-time (≥ 35 hrs/wk)",
    "Part-time / side-project",
    "Unknown",
    "Abandoned",
  ],
  "Prior Founder Experience": [
    "Two or more prior startups",
    "One prior startup",
    "None",
    "Unknown",
  ],
  "Product Maturity": [
    "Revenue-positive / paying customers",
    "Live MVP",
    "Prototype / pre-alpha",
    "Unknown",
  ],
  "Funding Status": ["Venture Backed", "Angel Investors", "Bootstrapped", "Unknown"],
  "Token-Product Integration Depth": [
    "Fully live",
    "Concept only (white-paper / roadmap)",
    "None",
    "Unknown",
  ],
  "Social Reach & Engagement Index": [
    // Literal strings from the sheet
    "High ( ≥ 20k followers)",
    "Medium (5k – 20k followers)",
    "Low (< 5k followers)",
    "Unknown",
  ],
};
