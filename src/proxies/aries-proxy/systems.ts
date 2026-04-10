import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { getSystems, getSystemsMetadata } from './api/systems';
import { System } from '~/types/aries-proxy/systems';
import { SystemSearchRequest } from '~/types/aries-proxy/systems';

const SystemListPageSize = 100;
const SystemAutocompletePageSize = 20;

export const SystemsQueryKeys = {
  list: (params: SystemSearchRequest) => ['systems', 'list', params] as const,
  metadata: (params: SystemSearchRequest) => ['systems', 'metadata', params] as const,
  search: (searchText: string) => ['systems', 'search', searchText] as const,
  byIds: (systemIds: number[]) => ['systems', 'byIds', [...systemIds].sort((a, b) => a - b)] as const,
};

export const useSystems = (params: SystemSearchRequest) => {
  return useInfiniteQuery({
    queryKey: SystemsQueryKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const pageSize = params.pageSize ?? SystemListPageSize;
      const response = await getSystems({
        ...params,
        pageIndex,
        pageSize,
      });

      return {
        ...response.data,
        pageParam: {
          pageIndex,
          pageSize,
        },
      };
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      if (data.systems.length < (params.pageSize ?? SystemListPageSize)) {
        return undefined;
      }

      return (Number(data.pageParam.pageIndex) + 1).toString();
    },
  });
};

export const useSystemsMetadata = (params: SystemSearchRequest) => {
  return useQuery({
    queryKey: SystemsQueryKeys.metadata(params),
    queryFn: async () => (await getSystemsMetadata(params)).data,
  });
};

export const useSystemsSearch = (searchText: string) => {
  return useQuery({
    queryKey: SystemsQueryKeys.search(searchText),
    queryFn: async () => {
      const response = await getSystems({
        search: searchText,
        pageIndex: 1,
        pageSize: SystemAutocompletePageSize,
      });
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
        uniqueIds.map(
          async (systemId) =>
            (
              await getSystems({
                search: String(systemId),
                pageIndex: 1,
                pageSize: SystemAutocompletePageSize,
              })
            ).data,
        ),
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
