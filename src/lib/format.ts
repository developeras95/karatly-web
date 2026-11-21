/** A number of grams per unit, shown without trailing zeros: 1000 → "1,000", 11.6638038 → "11.6638038". */
export function formatGrams(grams: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 7 }).format(grams);
}
