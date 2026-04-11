// Centralized Stripe Price IDs
// All payment flows reference these IDs to create Checkout Sessions.

export const MONTHLY_PRICE_IDS: Record<number, string> = {
  1: "price_1TBePOIyPpp79nUYGh0gypDS",
  5: "price_1TBeQ4IyPpp79nUYJ0jYFsMT",
  10: "price_1TBeQ4IyPpp79nUYzgSBrXYP",
  25: "price_1TBeQ4IyPpp79nUY2YCGs9MU",
  50: "price_1TBeQ4IyPpp79nUYDcMLL7YI",
  100: "price_1TBeQ4IyPpp79nUYmjF4t7c7",
};

export const ONE_TIME_PRICE_IDS: Record<number, string> = {
  1: "price_1TBeP3IyPpp79nUYaDclB7kw",
  5: "price_1TBebfIyPpp79nUYIKpJAvCR",
  10: "price_1TBeP3IyPpp79nUYYvgHo3zx",
  25: "price_1TBeP3IyPpp79nUYaKb4BvxW",
  50: "price_1TBeP3IyPpp79nUYegWHOhN3",
  100: "price_1TBeP3IyPpp79nUYK9qgPUU5",
};

// Custom donation price (used as fallback for non-preset amounts)
export const CUSTOM_DONATION_PRICE_ID = "price_1TBetiIyPpp79nUYCOvJhDJq";

// Product IDs for inline price_data (custom amounts)
export const MONTHLY_PRODUCT_ID = "prod_U9yMjK89S6XeBv";

export const TERRA_PRICE_IDS = {
  monthly: "price_1TDpkyIyPpp79nUY1T700Ppn",
  annual: "price_1TDqBEIyPpp79nUYHz5s8O4Q",
};

export const DONATION_AMOUNTS = [1, 5, 10, 25, 50, 100] as const;
