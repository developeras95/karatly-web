/** A number of grams per unit, shown without trailing zeros: 1000 → "1,000", 11.6638038 → "11.6638038". */
export function formatGrams(grams: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 7 }).format(grams);
}

/** An amount of money with its currency symbol, Indian digit grouping: 1234567.5 → "₹12,34,567.50". */
export function formatMoney(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: amount < 10 ? 4 : 2,
  }).format(amount);
}

/** A short amount for chart axes: 11469.36 → "₹11.5K", 135.06 → "₹135", 1.13 → "₹1.13". */
export function formatCompactMoney(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    notation: amount >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: amount >= 1000 ? 1 : amount < 10 ? 2 : 0,
  }).format(amount);
}

/** A date (YYYY-MM-DD) as "23 Nov 2026". */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** A moment as "23 Nov, 6:30 pm" in the browser's time zone. */
export function formatDateTime(isoInstant: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoInstant));
}

/** Today's date as YYYY-MM-DD in the browser's time zone. */
export function todayIso(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** The date a number of days before a YYYY-MM-DD date. */
export function daysBefore(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

/** Readable names for rate sources. */
export const SOURCE_LABELS: Record<string, string> = {
  GOLDPRICE_DEV: 'goldprice.dev',
  GOLDAPI_IO: 'goldapi.io',
  MANUAL: 'Entered by hand',
};
