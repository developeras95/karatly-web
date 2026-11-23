import { describe, expect, it } from 'vitest';
import { daysBefore, formatCompactMoney, formatDate, formatMoney, todayIso } from './format';

describe('format', () => {
  it('formats money with Indian digit grouping, and more decimals for small amounts', () => {
    expect(formatMoney(1234567.5)).toBe('₹12,34,567.50');
    expect(formatMoney(1.1285)).toBe('₹1.1285');
  });

  it('formats short amounts for chart axes', () => {
    expect(formatCompactMoney(11469.36)).toBe('₹11.5K');
    expect(formatCompactMoney(135.06)).toBe('₹135');
    expect(formatCompactMoney(1.128)).toBe('₹1.13');
  });

  it('formats and counts dates', () => {
    expect(formatDate('2026-11-24')).toBe('24 Nov 2026');
    expect(daysBefore('2026-03-01', 1)).toBe('2026-02-28');
    expect(todayIso(new Date(2026, 10, 24, 12))).toBe('2026-11-24');
  });
});
