import { useQuery } from '@tanstack/react-query';
import PostalMime from 'postal-mime';
import { getEmailById, getEmailEml } from './api/emails';

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
