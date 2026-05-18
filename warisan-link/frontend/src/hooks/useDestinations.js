import { useQuery } from '@tanstack/react-query';
import { destinationsApi } from '@/api/destinations.api';

export function useDestinations(params = {}) {
  return useQuery({
    queryKey: ['destinations', params],
    queryFn: () => destinationsApi.list(params).then((res) => res.data),
  });
}

export function useDestination(slug) {
  return useQuery({
    queryKey: ['destination', slug],
    queryFn: () => destinationsApi.getBySlug(slug).then((res) => res.data),
    enabled: !!slug,
  });
}
