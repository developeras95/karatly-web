import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { components } from './schema';

export type Metal = components['schemas']['Metal'];
export type WeightUnit = components['schemas']['WeightUnit'];

/** Reference data changes only with a new release, so it is cached for the whole session. */
const FOREVER = Infinity;

export function useMetals() {
  return useQuery({
    queryKey: ['metals'],
    queryFn: async () => (await api.GET('/api/v1/metals')).data ?? [],
    staleTime: FOREVER,
  });
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => (await api.GET('/api/v1/units')).data ?? [],
    staleTime: FOREVER,
  });
}
