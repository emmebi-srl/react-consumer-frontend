import { useMutation, useQuery } from '@tanstack/react-query';
import { getUserMe, logout } from './api/users';
import queryClient from '~/clients/query-client';

export const UsersQueryKeys = {
  me: ['users', 'me'] as const,
};

export const useUserMe = () => {
  return useQuery({
    queryKey: UsersQueryKeys.me,
    queryFn: async () => {
      const response = await getUserMe();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserLogout = () => {
  return useMutation({
    mutationFn: async () => {
      return logout();
    },
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });
};
