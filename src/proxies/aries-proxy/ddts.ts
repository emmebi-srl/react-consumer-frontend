import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DdtSearchRequest } from '~/types/aries-proxy/ddts';
import { getDdtsMetadata, getDdtsTotals, getDdtStatuses, getTransportCausals, searchDdts } from './api/ddts';

const DdtSearchPageSize = 50;

export const DdtQueryKeys = {
  search: (params?: DdtSearchRequest) => ['Ddts', 'search', params ?? {}] as const,
  metadata: (params?: DdtSearchRequest) => ['Ddts', 'metadata', params ?? {}] as const,
  totals: (params?: DdtSearchRequest) => ['Ddts', 'totals', params ?? {}] as const,
  statuses: ['DdtStatuses'] as const,
  causals: ['TransportCausals'] as const,
};

export const useDdtsSearch = (params?: DdtSearchRequest) => {
  const pageSize = params?.pageSize ?? DdtSearchPageSize;
  return useInfiniteQuery({
    queryKey: DdtQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const res = await searchDdts({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.ddts.length < pageSize ? undefined : data.pageIndex + 1),
  });
};

export const useDdtsMetadata = (params?: DdtSearchRequest) => {
  return useQuery({
    queryKey: DdtQueryKeys.metadata(params),
    queryFn: async () => (await getDdtsMetadata(params)).data,
  });
};

export const useDdtsTotals = (params?: DdtSearchRequest, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: DdtQueryKeys.totals(params),
    queryFn: async () => (await getDdtsTotals(params)).data,
    enabled: options?.enabled ?? true,
  });
};

export const useDdtStatuses = () => {
  return useQuery({
    queryKey: DdtQueryKeys.statuses,
    queryFn: async () => (await getDdtStatuses()).data,
  });
};

export const useTransportCausals = () => {
  return useQuery({
    queryKey: DdtQueryKeys.causals,
    queryFn: async () => (await getTransportCausals()).data,
  });
};
