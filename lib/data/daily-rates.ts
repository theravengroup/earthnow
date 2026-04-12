// Shared daily rate constants used across /today, /today/[date], and /embed pages.
// Values represent estimated daily totals for the current era.

export const DAILY_RATES = {
  births: 385000,
  deaths: 155000,
  populationGrowth: 230000,
  co2Tonnes: 115000000,
  treesLostHectares: 20000,
  energyMWh: 1580000000,
  waterLiters: 12000000000000,
  foodWastedTonnes: 3300000,
  googleSearches: 8500000000,
  militarySpending: 6300000000,
  educationSpending: 18000000000,
  photosTaken: 4700000000,
  mealsWasted: 3300000,
  // Technology & digital
  emailsSent: 350000000000,
  internetDataPB: 500000 / 86400 * 86400, // ~500K PB/day
  creditCardTransactions: 1500000000,
  aiTokensProcessed: 35000000000,
  // Environment
  treesPlanted: 5.8 * 86400,
  renewableEnergyMWh: 90480000,
  plasticEnteringOceans: 11000000 / 365,
  iceLostTonnes: 1300000000000 / 365,
  soilLostTonnes: 75000000000 / 365,
  // Society
  flightsInAir: 100000, // static snapshot
  vaccinesAdministered: 463 * 86400,
  hungerDeaths: 25000,
  /** World population (used as a static reference value) */
  population: 8100000000,
};
