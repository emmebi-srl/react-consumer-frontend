import { useMutation, useQuery } from '@tanstack/react-query';
import { getUserMe, getUserModulePermissions, logout } from './api/users';
import queryClient from '~/clients/query-client';

export const UsersQueryKeys = {
  me: ['users', 'me'] as const,
  modulePermissions: ['users', 'me', 'permissions'] as const,
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

export const useUserModulePermissions = () => {
  return useQuery({
    queryKey: UsersQueryKeys.modulePermissions,
    queryFn: async () => (await getUserModulePermissions()).data,
    staleTime: 5 * 60 * 1000,
  });
};

/** What the user can do in a module. The server enforces it too: this only adapts the UI. */
export const useModulePermission = (moduleId: number) => {
  const { data, isLoading } = useUserModulePermissions();
  return { isLoading, permission: data?.permissions.find((module) => module.moduleId === moduleId) };
};

/**
 * True for the users with the `aries_admin` role, like the Delphi admin settings (`TSessionProvider.IsAdmin`).
 * The server enforces it too: this only adapts the UI.
 */
export const useIsAriesAdmin = () => {
  const { data, isLoading } = useUserMe();
  const user = data?.users.at(0);
  return { isLoading, isAdmin: !!user?.roles.includes('aries_admin') };
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
