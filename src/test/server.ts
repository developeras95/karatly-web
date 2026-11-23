import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { Metal, WeightUnit } from '../api/reference';
import type { Premium, ProviderStatus, Rate, RateHistory } from '../api/rates';

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

/** The latest gold rate as Karatly returns it; override any field. */
export function aRate(overrides: Partial<Rate> = {}): Rate {
  return {
    metal: 'XAU',
    metalName: 'Gold',
    currency: 'INR',
    date: '2026-11-24',
    pricePerGram: 11902.16,
    spotPricePerGram: 10820.15,
    premiumPercent: 10,
    source: 'GOLDPRICE_DEV',
    pricedAt: '2026-11-24T05:51:02Z',
    stale: false,
    purities: [
      { label: '24K (999)', fineness: 0.999, pricePerGram: 11890.26 },
      { label: '22K (916)', fineness: 0.916, pricePerGram: 10902.38 },
    ],
    ...overrides,
  };
}

export const latestRates: Rate[] = [
  aRate(),
  aRate({
    metal: 'XAG',
    metalName: 'Silver',
    pricePerGram: 127.41,
    spotPricePerGram: 127.41,
    premiumPercent: 0,
    purities: [{ label: '925 (sterling)', fineness: 0.925, pricePerGram: 117.85 }],
  }),
  aRate({
    metal: 'XCU',
    metalName: 'Copper',
    pricePerGram: 1.1285,
    spotPricePerGram: 1.1285,
    premiumPercent: 0,
    date: '2026-11-20',
    stale: true,
    purities: [],
  }),
];

export const goldHistory: RateHistory = {
  metal: 'XAU',
  currency: 'INR',
  from: '2026-10-25',
  to: '2026-11-24',
  points: [
    { date: '2026-11-22', pricePerGram: 11800, source: 'GOLDPRICE_DEV' },
    { date: '2026-11-23', pricePerGram: 11850.5, source: 'MANUAL' },
    { date: '2026-11-24', pricePerGram: 11902.16, source: 'GOLDPRICE_DEV' },
  ],
};

export const providers: ProviderStatus[] = [
  {
    provider: 'GOLDPRICE_DEV',
    metals: ['XAU', 'XAG', 'XCU'],
    available: true,
    unavailableReason: null,
    ttlMinutes: 720,
    requestsThisMonth: 46,
    monthlyBudget: 4500,
    lastFetchAt: '2026-11-24T05:51:02Z',
    lastFetchSucceeded: true,
    nextFetchDue: '2026-11-24T17:51:02Z',
  },
  {
    provider: 'GOLDAPI_IO',
    metals: ['XPT', 'XPD'],
    available: false,
    unavailableReason: 'No API key: set KARATLY_GOLDAPI_IO_API_KEY (free key at goldapi.io).',
    ttlMinutes: 720,
    requestsThisMonth: 0,
    monthlyBudget: 140,
    lastFetchAt: null,
    lastFetchSucceeded: null,
    nextFetchDue: '2026-11-24T06:00:00Z',
  },
];

export const premiums: Premium[] = [
  { metal: 'XAG', premiumPercent: 0, updatedAt: '2026-11-23T10:00:00Z' },
  { metal: 'XAU', premiumPercent: 10, updatedAt: '2026-11-23T10:00:00Z' },
];

/** A Karatly problem detail response. */
export function problem(status: number, code: string, detail: string, errors?: { field: string; message: string }[]) {
  return HttpResponse.json(
    { title: 'Error', status, detail, code, ...(errors ? { errors } : {}) },
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
  http.get('*/api/v1/rates/latest', () => HttpResponse.json(latestRates)),
  http.get('*/api/v1/rates/history', () => HttpResponse.json(goldHistory)),
  http.get('*/api/v1/rates/providers', () => HttpResponse.json(providers)),
  http.get('*/api/v1/rates/premiums', () => HttpResponse.json(premiums)),
  http.get('*/actuator/health', () => HttpResponse.json({ status: 'UP', components: { db: { status: 'UP' } } })),
);
