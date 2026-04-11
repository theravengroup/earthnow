// Centralized Stripe Payment Links
// All donation flows should reference these links to ensure consistency.

export const monthlyLinks: Record<number, string> = {
  1: "https://buy.stripe.com/6oU28s9BQ0HY300diBfYY03",
  5: "https://buy.stripe.com/8x23cwaFUfCSfMM3I1fYY04",
  10: "https://buy.stripe.com/3cI7sM4hw76m588diBfYY05",
  25: "https://buy.stripe.com/dRmfZi9BQ76m6ccfqJfYY06",
  50: "https://buy.stripe.com/cNiaEY7tIgGW8kk4M5fYY07",
  100: "https://buy.stripe.com/4gM28s6pE4Ye7ggguNfYY08",
};

export const oneTimeLinks: Record<number | "custom", string> = {
  1: "https://buy.stripe.com/7sY3cw4hweyOdEEbatfYY09",
  5: "https://buy.stripe.com/00w28sdS62Q6bww7YhfYY0b",
  10: "https://buy.stripe.com/aFa9AUdS62Q6ass7YhfYY0c",
  25: "https://buy.stripe.com/14AcN69BQ8aq6cc7YhfYY0e",
  50: "https://buy.stripe.com/fZu8wQaFUaiyeIIa6pfYY0f",
  100: "https://buy.stripe.com/3cIcN66pE1M27gg3I1fYY0g",
  custom: "https://buy.stripe.com/7sYcN615k3Ua6cc1zTfYY0h",
};

// Terra-specific links (physical product orders)
export const terraLinks = {
  poster: "https://buy.stripe.com/7sYdRa6pEcqGass2DXfYY0i",
  print: "https://buy.stripe.com/6oU5kE15k3Ua7gg1zTfYY0j",
};

// Default support link (used in today pages, etc.)
export const defaultSupportLink = monthlyLinks[5];
