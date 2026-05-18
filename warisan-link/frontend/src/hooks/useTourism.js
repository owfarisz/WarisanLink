import { useQuery } from '@tanstack/react-query';
import { tourismApi } from '@/api/tourism.api';
import { weatherApi } from '@/api/compass.api';

export function useTourism(params = {}, options = {}) {
  return useQuery({
    queryKey: ['tourism', params],
    queryFn: () => tourismApi.list(params).then((res) => res.data),
    ...options,
  });
}

export function useTourismNearby(params = {}) {
  return useQuery({
    queryKey: ['tourism-nearby', params],
    queryFn: () => tourismApi.nearby(params).then((res) => res.data),
    enabled: !!params.lat && !!params.lon,
  });
}

export function useTourismCountries() {
  return useQuery({
    queryKey: ['tourism-countries'],
    queryFn: () => tourismApi.countries().then((res) => res.data),
  });
}

export function useTourismProvinces(country = 'ID') {
  return useQuery({
    queryKey: ['tourism-provinces', country],
    queryFn: () => tourismApi.provinces(country).then((res) => res.data),
    enabled: !!country,
  });
}

export function useTourismCategories() {
  return useQuery({
    queryKey: ['tourism-categories'],
    queryFn: () => tourismApi.categories().then((res) => res.data),
  });
}

export function usePlaceWeather(lat, lon) {
  return useQuery({
    queryKey: ['place-weather', lat, lon],
    queryFn: () => weatherApi.getCurrent(lat, lon).then((res) => res.data),
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 10,
  });
}
