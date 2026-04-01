import { useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { searchSystems } from './api/systems';
import { System } from '~/types/aries-proxy/systems';

export const SystemsQueryKeys = {
  search: (searchText: string) => ['systems', 'search', searchText] as const,
  byIds: (systemIds: number[]) => ['systems', 'byIds', [...systemIds].sort((a, b) => a - b)] as const,
};

export const useSystemsSearch = (searchText: string) => {
  return useQuery({
    queryKey: SystemsQueryKeys.search(searchText),
    queryFn: async () => {
      const response = await searchSystems(searchText);
      return response.data;
    },
    enabled: !_isEmpty(searchText),
  });
};

export const useSystemsByIds = (systemIds: number[]) => {
  return useQuery({
    queryKey: SystemsQueryKeys.byIds(systemIds),
    queryFn: async () => {
      const uniqueIds = [...new Set(systemIds)].sort((a, b) => a - b);
      const responses = await Promise.all(
        uniqueIds.map(async (systemId) => (await searchSystems(String(systemId))).data),
      );

      return responses.reduce<Record<number, System>>((acc, response, index) => {
        const requestedId = uniqueIds[index];
        if (!requestedId) {
          return acc;
        }

        const system = response.systems.find((item) => item.id === requestedId);
        if (system) {
          acc[requestedId] = system;
        }

        return acc;
      }, {});
    },
    enabled: systemIds.length > 0,
  });
};
