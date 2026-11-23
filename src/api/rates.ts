import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { components } from './schema';

export type Rate = components['schemas']['Rate'];
export type RateHistory = components['schemas']['RateHistory'];
export type ManualRateRequest = components['schemas']['ManualRateRequest'];
export type RefreshResult = components['schemas']['RefreshResult'];
export type ProviderStatus = components['schemas']['ProviderStatus'];
export type Premium = components['schemas']['Premium'];

const keys = {
  latest: ['rates', 'latest'] as const,
  history: (metal: string, from: string) => ['rates', 'history', metal, from] as const,
  providers: ['rates', 'providers'] as const,
  premiums: ['rates', 'premiums'] as const,
};

/** Latest rate of every metal. The API fetches anything past its cache TTL before answering. */
export function useLatestRates() {
  return useQuery({
    queryKey: keys.latest,
    queryFn: async () => (await api.GET('/api/v1/rates/latest')).data ?? [],
  });
}

/** One rate per day for a metal, from a date (YYYY-MM-DD) until today. */
export function useRateHistory(metal: string, from: string) {
  return useQuery({
    queryKey: keys.history(metal, from),
    queryFn: async () => (await api.GET('/api/v1/rates/history', { params: { query: { metal, from } } })).data!,
    enabled: metal !== '',
  });
}

export function useProviders() {
  return useQuery({
    queryKey: keys.providers,
    queryFn: async () => (await api.GET('/api/v1/rates/providers')).data ?? [],
  });
}

export function usePremiums() {
  return useQuery({
    queryKey: keys.premiums,
    queryFn: async () => (await api.GET('/api/v1/rates/premiums')).data ?? [],
  });
}

/** Everything that shows rates, refetched after a change. */
function useInvalidateRates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['rates'] });
}

export function useAddManualRate() {
  const invalidate = useInvalidateRates();
  return useMutation({
    mutationFn: async (body: ManualRateRequest) => (await api.POST('/api/v1/rates', { body })).data!,
    onSuccess: invalidate,
  });
}

export function useUpdatePremium() {
  const invalidate = useInvalidateRates();
  return useMutation({
    mutationFn: async ({ metal, premiumPercent }: { metal: string; premiumPercent: number }) =>
      (await api.PUT('/api/v1/rates/premiums/{metal}', { params: { path: { metal } }, body: { premiumPercent } }))
        .data!,
    onSuccess: invalidate,
  });
}

/** Fetches from every provider now, ignoring the cache TTL (monthly budgets still apply). */
export function useRefreshRates() {
  const invalidate = useInvalidateRates();
  return useMutation({
    mutationFn: async () =>
      (await api.POST('/api/v1/rates/refresh', { params: { query: { force: true } } })).data ?? [],
    onSuccess: invalidate,
  });
}
