import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import PostalMime from 'postal-mime';
import { EmailSearchRequest } from '~/types/aries-proxy/emails';
import { getEmailById, getEmailEml, getEmailsMetadata, getEmailStatuses, searchEmails } from './api/emails';

const EmailSearchPageSize = 50;

export const EmailsQueryKeys = {
  search: (params?: EmailSearchRequest) => ['Email', 'search', params ?? {}] as const,
  metadata: (params?: EmailSearchRequest) => ['Email', 'metadata', params ?? {}] as const,
  statuses: ['Email', 'statuses'] as const,
};

export const useEmailsSearch = (params?: EmailSearchRequest) => {
  const pageSize = params?.pageSize ?? EmailSearchPageSize;
  return useInfiniteQuery({
    queryKey: EmailsQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const res = await searchEmails({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.emails.length < pageSize ? undefined : data.pageIndex + 1),
  });
};

export const useEmailsMetadata = (params?: EmailSearchRequest) => {
  return useQuery({
    queryKey: EmailsQueryKeys.metadata(params),
    queryFn: async () => (await getEmailsMetadata(params)).data,
  });
};

export const useEmailStatuses = () => {
  return useQuery({
    queryKey: EmailsQueryKeys.statuses,
    queryFn: async () => (await getEmailStatuses()).data,
  });
};

export const useEmailById = (id?: number | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['Email', id],
    queryFn: async () => (await getEmailById(id as number)).data,
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useEmailEml = (id?: number | null) => {
  return useQuery({
    queryKey: ['EmailEml', id],
    queryFn: async () => PostalMime.parse((await getEmailEml(id as number)).data),
    enabled: !!id,
    retry: false,
  });
};
