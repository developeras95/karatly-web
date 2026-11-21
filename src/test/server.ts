import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { Metal, WeightUnit } from '../api/reference';

export const metals: Metal[] = [
  { code: 'XAU', name: 'Gold' },
  { code: 'XAG', name: 'Silver' },
  { code: 'XPT', name: 'Platinum' },
  { code: 'XPD', name: 'Palladium' },
];

export const units: WeightUnit[] = [
  { code: 'G', name: 'Gram', symbol: 'g', gramsPerUnit: 1 },
  { code: 'KG', name: 'Kilogram', symbol: 'kg', gramsPerUnit: 1000 },
  { code: 'TOLA', name: 'Tola', symbol: 'tola', gramsPerUnit: 11.6638038 },
];

/** A Karatly problem detail response. */
export function problem(status: number, code: string, detail: string) {
  return HttpResponse.json(
    { title: 'Error', status, detail, code },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

/**
 * A stand-in for the Karatly API during tests. Tests add or replace handlers with server.use(...).
 * Any request without a handler fails the test, so nothing calls a real server by accident.
 */
export const server = setupServer(
  http.get('*/api/v1/metals', () => HttpResponse.json(metals)),
  http.get('*/api/v1/units', () => HttpResponse.json(units)),
  http.get('*/actuator/health', () => HttpResponse.json({ status: 'UP', components: { db: { status: 'UP' } } })),
);
