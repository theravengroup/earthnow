/**
 * Impact Calculator Constants & Formulas
 * 
 * This file contains all configurable assumptions and data sources
 * for the Lifetime Impact Calculator. Values can be easily updated
 * as better data becomes available.
 * 
 * Data sources and methodology should be documented here.
 */

// ============================================
// TIME ALLOCATION (per year, based on average human behavior)
// ============================================
export const TIME_CONSTANTS = {
  // Sleep: ~8 hours per day average across lifespan
  HOURS_SLEEP_PER_DAY: 8,
  
  // Work: ~40 hours/week for ~45 years (ages 20-65)
  // Average across full lifespan: ~4.5 hours/day
  HOURS_WORK_PER_DAY_WORKING_YEARS: 8,
  WORKING_YEARS_START: 20,
  WORKING_YEARS_END: 65,
  
  // Screen time: average ~7 hours/day (adults, increasing trend)
  // Source: eMarketer, Statista global averages
  HOURS_SCREEN_PER_DAY: 7,
  
  // Eating: ~1.5 hours/day
  HOURS_EATING_PER_DAY: 1.5,
  
  // Commuting: ~0.75 hours/day (working years only)
  HOURS_COMMUTE_PER_DAY: 0.75,
};

// ============================================
// DIGITAL FOOTPRINT (per year estimates)
// ============================================
export const DIGITAL_CONSTANTS = {
  // Photos: Average smartphone user takes ~1,200 photos/year
  // Source: InfoTrends, Rise Above Research
  PHOTOS_PER_YEAR: 1200,
  
  // Messages: ~94 texts/day = ~34,000/year
  // Source: Pew Research, texting + messaging apps
  MESSAGES_PER_YEAR: 34000,
  
  // Internet searches: ~3-4 searches/day = ~1,300/year
  // Source: Google/Comscore data
  SEARCHES_PER_YEAR: 1300,
  
  // Data generated: ~1.7 MB per person per second globally
  // Simplified to ~2.5 GB/day = ~900 GB/year personal data footprint
  // Source: Domo Data Never Sleeps reports
  DATA_GB_PER_YEAR: 900,
  
  // Emails: ~40 sent + 120 received per day = ~58,000/year
  // Source: Radicati Group
  EMAILS_PER_YEAR: 58000,
};

// ============================================
// WASTE GENERATION
// ============================================
export const WASTE_CONSTANTS = {
  // Average American: ~4.4 lbs trash/day = ~1,600 lbs/year
  // Lifetime (78 years): ~102 tons
  // Source: EPA data
  POUNDS_TRASH_PER_YEAR: 1600,
  
  // Plastic waste: ~100 lbs plastic/year per American
  // Source: EPA, Break Free From Plastic
  POUNDS_PLASTIC_PER_YEAR: 100,
  
  // E-waste: ~46 lbs/year per person in developed countries
  // Source: Global E-waste Monitor
  POUNDS_EWASTE_PER_YEAR: 46,

  // Human feces: ~1 oz (0.0625 lbs) per bowel movement, avg 1-2x/day
  // ~14 oz/day = ~0.875 lbs/day = ~320 lbs/year
  // Source: Medical literature (average ~128g/day or ~0.28 lbs/day)
  // Using 0.28 lbs/day = ~102 lbs/year
  POUNDS_POOP_PER_YEAR: 102,
};

// ============================================
// ENERGY EQUIVALENTS
// ============================================
export const ENERGY_CONSTANTS = {
  // Average US household: ~10,500 kWh/year
  // Per person: ~4,000 kWh/year (varies widely)
  KWH_PER_YEAR: 4000,
  
  // Barrel of oil: ~1,700 kWh equivalent
  // Source: EIA
  KWH_PER_BARREL_OIL: 1700,
  
  // Average solar panel: ~400 kWh/year production
  // Source: EnergySage
  KWH_PER_SOLAR_PANEL_YEAR: 400,
  
  // Average home electricity: ~10,500 kWh/year
  HOME_KWH_PER_YEAR: 10500,
};

// ============================================
// HUMAN INTERACTIONS
// ============================================
export const SOCIAL_CONSTANTS = {
  // People met in lifetime: ~10,000-80,000 (using 50,000 average)
  // Source: Various sociological studies
  PEOPLE_MET_PER_YEAR: 650, // ~50,000 over 78 years
  
  // Conversations per day: ~16 (varies by personality)
  // Source: Matthias Mehl research
  CONVERSATIONS_PER_DAY: 16,
  
  // Meals shared: ~1-2 per day with others
  // Estimate: ~500/year
  MEALS_SHARED_PER_YEAR: 500,
  
  // Close relationships: ~5 intimate, ~15 close, ~50 friends, ~150 acquaintances
  // Source: Dunbar's number research
  CLOSE_RELATIONSHIPS: 5,
  GOOD_FRIENDS: 15,
  FRIENDS: 50,
  ACQUAINTANCES: 150,
};

// ============================================
// INFLUENCE & LEGACY
// ============================================
export const INFLUENCE_CONSTANTS = {
  // Direct influence: ~1,000 people meaningfully influenced in lifetime
  // Estimate based on social network research
  PEOPLE_DIRECTLY_INFLUENCED_PER_YEAR: 13,
  
  // Ideas shared: ~10 significant ideas/opinions per day
  IDEAS_SHARED_PER_DAY: 10,
  
  // Social reach: Average social media followers/connections
  // ~500 direct connections on average
  AVERAGE_SOCIAL_REACH: 500,
  
  // Second-degree reach multiplier
  SECOND_DEGREE_MULTIPLIER: 3.5,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function calculateYearsLived(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - birthYear);
}

export function calculateDaysLived(birthYear: number): number {
  const yearsLived = calculateYearsLived(birthYear);
  return Math.floor(yearsLived * 365.25);
}

export function calculateWorkingYears(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  
  if (age < TIME_CONSTANTS.WORKING_YEARS_START) return 0;
  if (age > TIME_CONSTANTS.WORKING_YEARS_END) {
    return TIME_CONSTANTS.WORKING_YEARS_END - TIME_CONSTANTS.WORKING_YEARS_START;
  }
  return Math.max(0, age - TIME_CONSTANTS.WORKING_YEARS_START);
}

// ============================================
// COLOR PALETTE FOR NEW SECTIONS
// ============================================
export const SECTION_COLORS = {
  time: '#a855f7',      // Purple - reflective
  digital: '#3b82f6',   // Blue - tech
  waste: '#ef4444',     // Red - warning
  energy: '#f59e0b',    // Amber - power
  social: '#ec4899',    // Pink - warm/human
  influence: '#14b8a6', // Teal - growth
};
