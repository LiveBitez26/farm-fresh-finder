/** Format a number as money using a given ISO 4217 currency code,
 * defaulting to USD. Centralizes currency formatting so every page reads
 * from the organization's actual currency setting instead of hardcoding
 * a dollar sign. */
export function formatMoney(amount: number, currencyCode: string | null | undefined) {
  const code = currencyCode || "USD";
  try {
    return amount.toLocaleString(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    });
  } catch {
    // Fall back gracefully if an invalid/unsupported code ever sneaks in.
    return `${code} ${amount.toFixed(2)}`;
  }
}

export const CURRENCY_OPTIONS = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "NGN", label: "Nigerian Naira (NGN)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "MXN", label: "Mexican Peso (MXN)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
];
