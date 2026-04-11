// Vital Signs data extracted from app/page.tsx

// Shared constant for AI tokens processed per day (85 billion/day for 2026 estimate)
export const AI_TOKENS_PER_DAY = 85_000_000_000;
export const AI_TOKENS_PER_SECOND = AI_TOKENS_PER_DAY / 86400;

export interface MetricConfig {
  color: string;
  label: string;
  ratePerSecond: number;
  useAbbreviated?: boolean;
  prefix?: string;
  staticValue?: number;
  staticRateDisplay?: string;
  decimalPlaces?: number;
}

// Civilization Signals - the most powerful indicators of humanity and the planet
export const civilizationSignals: MetricConfig[] = [
  { color: "#f59e0b", label: "Human Years of Life Lived Today", ratePerSecond: 8100000000 / 86400, useAbbreviated: true },
  { color: "#92400e", label: "Tonnes of Soil Lost Today", ratePerSecond: 75000000000 / 365 / 86400, useAbbreviated: true },
  { color: "#38bdf8", label: "Tonnes of Ice Lost Today", ratePerSecond: 1300000000000 / 365 / 86400, useAbbreviated: true },
  { color: "#10b981", label: "Global GDP Generated Today ($)", ratePerSecond: 275000000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#a855f7", label: "Hours of Human Attention Online Today", ratePerSecond: 12000000000 / 86400, useAbbreviated: true },
  { color: "#ec4899", label: "AI Tokens Processed Today", ratePerSecond: AI_TOKENS_PER_SECOND, useAbbreviated: true },
  { color: "#06b6d4", label: "Tonnes of Plastic Entering Oceans Today", ratePerSecond: 11000000 / 365 / 86400, useAbbreviated: false },
  { color: "#3b82f6", label: "Total Human Hours Worked Today", ratePerSecond: 8000000000 * 8 / 86400, useAbbreviated: true },
  { color: "#eab308", label: "Global Electricity Generated Today (MWh)", ratePerSecond: 77000000 / 86400, useAbbreviated: true },
  { color: "#14b8a6", label: "Global Internet Data Flow Today (PB)", ratePerSecond: 500000 / 86400, useAbbreviated: true },
  { color: "#22d3ee", label: "Global Flights in the Air Right Now", ratePerSecond: 0, staticValue: 12500, useAbbreviated: false, staticRateDisplay: "~12.5K at any moment" },
  { color: "#ef4444", label: "Species Moved Toward Extinction Today", ratePerSecond: 0.10 / 60, decimalPlaces: 2, useAbbreviated: false },
  { color: "#f97316", label: "Children Born into Poverty Today", ratePerSecond: 105 / 60, useAbbreviated: false },
  { color: "#3b82f6", label: "Clean Water Used Today", ratePerSecond: 8333333 / 60, useAbbreviated: true },
  { color: "#f472b6", label: "Money Spent on Advertising Today ($)", ratePerSecond: 1900000 / 60, useAbbreviated: true, prefix: "$" },
];

// Vital Signs metrics data
export const vitalSignsRow1: MetricConfig[] = [
  { color: "#22c55e", label: "Births Today", ratePerSecond: 4.4 },
  { color: "#ef4444", label: "Deaths Today", ratePerSecond: 1.8 },
  { color: "#10b981", label: "Population Growth Today", ratePerSecond: 2.6 },
  { color: "#f97316", label: "Hunger Deaths Today", ratePerSecond: 0.29 },
  { color: "#eab308", label: "Road Fatalities Today", ratePerSecond: 0.043 },
  { color: "#f59e0b", label: "Babies Born Into Poverty Today", ratePerSecond: 1.76 },
  { color: "#06b6d4", label: "Children Born Today", ratePerSecond: 4.4 },
  { color: "#a855f7", label: "Years of Human Life Added Today", ratePerSecond: 140000000 / 86400, useAbbreviated: true },
  { color: "#64748b", label: "People Ever Lived", ratePerSecond: 2.6, useAbbreviated: false },
  { color: "#14b8a6", label: "People Turning 18 Today", ratePerSecond: 360000 / 86400, useAbbreviated: false },
  { color: "#8b5cf6", label: "People Turning 65 Today", ratePerSecond: 210000 / 86400, useAbbreviated: false },
  { color: "#ec4899", label: "Human Years of Life Lived Today", ratePerSecond: 8100000000 / 86400, useAbbreviated: true },
  { color: "#ef4444", label: "Deaths from Pregnancy/Childbirth", ratePerSecond: 0.56 / 60, useAbbreviated: false },
  { color: "#f97316", label: "Infant Deaths Today", ratePerSecond: 9.72 / 60, useAbbreviated: false },
  { color: "#f59e0b", label: "Refugees Displaced Today", ratePerSecond: 43.75 / 60, useAbbreviated: false },
];

export const vitalSignsRow2: MetricConfig[] = [
  { color: "#eab308", label: "CO₂ Emitted Today (tonnes)", ratePerSecond: 1337, useAbbreviated: false },
  { color: "#ef4444", label: "Forest Lost Today (hectares)", ratePerSecond: 0.23, useAbbreviated: false },
  { color: "#22c55e", label: "Trees Planted Today", ratePerSecond: 5.8, useAbbreviated: false },
  { color: "#f97316", label: "Food Wasted Today (kg)", ratePerSecond: 38, useAbbreviated: false },
  { color: "#3b82f6", label: "Clean Water Used Today", ratePerSecond: 138000, useAbbreviated: true },
  { color: "#06b6d4", label: "Ocean Fish Caught Today (tonnes)", ratePerSecond: 260000 / 86400, useAbbreviated: false },
  { color: "#64748b", label: "Wildlife Animals Killed Today", ratePerSecond: 3000000000 / 86400, useAbbreviated: true },
  { color: "#d97706", label: "Land Turned to Desert Today", ratePerSecond: 33000 / 86400, useAbbreviated: false },
  { color: "#38bdf8", label: "Ice Mass Lost Today (tonnes)", ratePerSecond: 1300000000000 / 365 / 86400, useAbbreviated: true },
  { color: "#f43f5e", label: "Ocean Heat Added Today", ratePerSecond: 500000 / 86400, useAbbreviated: false },
  { color: "#a855f7", label: "Species Moved Toward Extinction Today", ratePerSecond: 150 / 86400, useAbbreviated: false },
  { color: "#92400e", label: "Soil Lost to Erosion Today (tonnes)", ratePerSecond: 75000000000 / 365 / 86400, useAbbreviated: true },
  { color: "#06b6d4", label: "Freshwater Species Lost Today", ratePerSecond: 0.05 / 60, useAbbreviated: false },
  { color: "#f43f5e", label: "Coral Reef Destroyed Today (hectares)", ratePerSecond: 1.98 / 60, useAbbreviated: false },
  { color: "#a855f7", label: "Methane Emitted Today (tonnes)", ratePerSecond: 694.44 / 60, useAbbreviated: false },
];

// Row 3 - Health
export const vitalSignsRow3: MetricConfig[] = [
  { color: "#a855f7", label: "Cigarettes Smoked Today", ratePerSecond: 15000000000 / 86400, useAbbreviated: true },
  { color: "#ef4444", label: "Cancer Deaths Today", ratePerSecond: 27000 / 86400, useAbbreviated: false },
  { color: "#f43f5e", label: "Heart Disease Deaths Today", ratePerSecond: 49000 / 86400, useAbbreviated: false },
  { color: "#6366f1", label: "Suicides Today", ratePerSecond: 2200 / 86400, useAbbreviated: false },
  { color: "#d946ef", label: "Alcohol Consumed Today (liters)", ratePerSecond: 17500000 / 86400, useAbbreviated: true },
  { color: "#f97316", label: "Obesity-Related Deaths Today", ratePerSecond: 7123 / 86400, useAbbreviated: false },
  { color: "#64748b", label: "Air Pollution Deaths Today", ratePerSecond: 19178 / 86400, useAbbreviated: false },
  { color: "#eab308", label: "New Diabetes Cases Today", ratePerSecond: 4100000 / 86400 / 365, useAbbreviated: false },
  { color: "#94a3b8", label: "Hours of Human Sleep Lost Today", ratePerSecond: 2400000000 / 86400, useAbbreviated: true },
  { color: "#ec4899", label: "Mental Health Crisis Calls Today", ratePerSecond: 1500000 / 86400, useAbbreviated: false },
  { color: "#22c55e", label: "Hours Spent Exercising Today", ratePerSecond: 500000000 / 86400, useAbbreviated: true },
  { color: "#06b6d4", label: "Antibiotic Doses Used Today", ratePerSecond: 200000000 / 86400, useAbbreviated: true },
  { color: "#c084fc", label: "Antidepressant Doses Taken Today", ratePerSecond: 520833 / 60, useAbbreviated: true },
  { color: "#94a3b8", label: "People Living With Long COVID", ratePerSecond: 0, staticValue: 65000000, useAbbreviated: true },
  { color: "#fb923c", label: "Microplastics Ingested Today", ratePerSecond: 0.001 / 60, decimalPlaces: 4, useAbbreviated: false },
];

// Row 4 - Money & Power
export const vitalSignsRow4: MetricConfig[] = [
  { color: "#ef4444", label: "Military Spending Today ($)", ratePerSecond: 6300000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#22c55e", label: "Healthcare Spending Today ($)", ratePerSecond: 24000000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#f97316", label: "Illegal Drugs Spending Today ($)", ratePerSecond: 1400000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#eab308", label: "Oil Pumped Today (barrels)", ratePerSecond: 100000000 / 86400, useAbbreviated: true },
  { color: "#64748b", label: "Plastic Produced Today (tonnes)", ratePerSecond: 1000000 / 86400, useAbbreviated: false },
  { color: "#10b981", label: "Global GDP Generated Today ($)", ratePerSecond: 275000000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#3b82f6", label: "Stock Market Value Traded Today ($)", ratePerSecond: 450000000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#06b6d4", label: "Food Industry Revenue Today ($)", ratePerSecond: 27000000000 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#a855f7", label: "Global Taxes Collected Today ($)", ratePerSecond: 55000000000000 / 365 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#f43f5e", label: "Government Debt Added Today ($)", ratePerSecond: 8500000000000 / 365 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#14b8a6", label: "Corporate Profits Generated Today ($)", ratePerSecond: 50000000000000 / 365 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#ec4899", label: "Money Spent on Advertising Today ($)", ratePerSecond: 1000000000000 / 365 / 86400, useAbbreviated: true, prefix: "$" },
  { color: "#ef4444", label: "Fossil Fuel Subsidies Today ($)", ratePerSecond: 11500000 / 60, useAbbreviated: true, prefix: "$" },
  { color: "#fbbf24", label: "Billionaire Wealth Growth Today ($)", ratePerSecond: 2800000 / 60, useAbbreviated: true, prefix: "$" },
  { color: "#34d399", label: "Money Sent in Remittances Today ($)", ratePerSecond: 1700000 / 60, useAbbreviated: true, prefix: "$" },
];

// Row 5 - Technology
export const vitalSignsRow5: MetricConfig[] = [
  { color: "#3b82f6", label: "Google Searches Today", ratePerSecond: 8500000000 / 86400, useAbbreviated: true },
  { color: "#06b6d4", label: "Tweets Posted Today", ratePerSecond: 500000000 / 86400, useAbbreviated: true },
  { color: "#ef4444", label: "YouTube Videos Watched Today", ratePerSecond: 5000000000 / 86400, useAbbreviated: true },
  { color: "#8b5cf6", label: "Smartphones Sold Today", ratePerSecond: 3800000 / 86400, useAbbreviated: false },
  { color: "#f59e0b", label: "Photos Taken Today", ratePerSecond: 4700000000 / 86400, useAbbreviated: true },
  { color: "#a855f7", label: "Emails Sent Today", ratePerSecond: 333000000000 / 86400, useAbbreviated: true },
  { color: "#10b981", label: "AI Queries Run Today", ratePerSecond: 10000000000 / 86400, useAbbreviated: true },
  { color: "#f43f5e", label: "Data Created Today (TB)", ratePerSecond: 400000 / 86400, useAbbreviated: true },
  { color: "#ec4899", label: "AI Images Generated Today", ratePerSecond: 50000000 / 86400, useAbbreviated: true },
  { color: "#22c55e", label: "AI Tokens Processed Today", ratePerSecond: AI_TOKENS_PER_SECOND, useAbbreviated: true },
  { color: "#eab308", label: "Internet Data Traffic Today", ratePerSecond: 500000 / 86400, useAbbreviated: true },
  { color: "#64748b", label: "Satellite Signals Transmitted Today", ratePerSecond: 1000000000000 / 86400, useAbbreviated: true },
  { color: "#22d3ee", label: "Lines of Code Written Today", ratePerSecond: 4166667 / 60, useAbbreviated: true },
  { color: "#ef4444", label: "Passwords Compromised Today", ratePerSecond: 578 / 60, useAbbreviated: false },
  { color: "#f472b6", label: "TikTok Videos Watched Today", ratePerSecond: 8333333 / 60, useAbbreviated: true },
];
