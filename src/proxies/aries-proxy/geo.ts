import { useQuery } from '@tanstack/react-query';
import { getFrazioniByComune, searchComune } from './api/geo';

export const GeoQueryKeys = {
  comuneSearch: (search: string) => ['Geo', 'comune', 'search', search] as const,
  frazioniByComune: (comuneId: number) => ['Geo', 'comune', comuneId, 'frazione'] as const,
};

export const useComuneSearch = (search: string) => {
  return useQuery({
    queryKey: GeoQueryKeys.comuneSearch(search),
    queryFn: async () => (await searchComune(search)).data,
    enabled: search.length >= 2,
  });
};

export const useFrazioniByComune = (comuneId: number | null) => {
  return useQuery({
    queryKey: GeoQueryKeys.frazioniByComune(comuneId ?? 0),
    queryFn: async () => (await getFrazioniByComune(comuneId ?? 0)).data,
    enabled: !!comuneId,
  });
};
