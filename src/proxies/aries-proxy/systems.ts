import { useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { searchSystems } from './api/systems';

export const SystemsQueryKeys = {
  search: (searchText: string) => ['systems', 'search', searchText] as const,
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
