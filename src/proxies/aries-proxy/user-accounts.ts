import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '~/clients/query-client';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { UserAccountSaveRequest } from '~/types/aries-proxy/users';
import {
  createUserAccount,
  deleteUserAccount,
  deleteUserAccountPasskey,
  getUserAccount,
  getUserAccountPasskeys,
  getUserAccounts,
  getUserRoles,
  getUserTypes,
  updateUserAccount,
} from './api/user-accounts';
import { UsersQueryKeys } from './users';

/** Users management (Delphi TFSettingsUsers), admin only. */
export const UserAccountsQueryKeys = {
  all: ['user-accounts'] as const,
  list: ['user-accounts', 'list'] as const,
  detail: (userId: number) => ['user-accounts', 'detail', userId] as const,
  passkeys: (userId: number) => ['user-accounts', 'detail', userId, 'passkeys'] as const,
  types: ['user-accounts', 'types'] as const,
  roles: ['user-accounts', 'roles'] as const,
};

const invalidateUsers = () => {
  void queryClient.invalidateQueries({ queryKey: UserAccountsQueryKeys.all });
  // The admin may have changed their own account (roles, email).
  void queryClient.invalidateQueries({ queryKey: UsersQueryKeys.me });
};

export const useUserAccounts = () =>
  useQuery({
    queryKey: UserAccountsQueryKeys.list,
    queryFn: async () => (await getUserAccounts()).data.users,
  });

export const useUserAccount = (userId: number | null) =>
  useQuery({
    queryKey: UserAccountsQueryKeys.detail(userId ?? 0),
    queryFn: async () => (await getUserAccount(userId ?? 0)).data,
    enabled: !!userId,
  });

export const useUserTypes = () =>
  useQuery({
    queryKey: UserAccountsQueryKeys.types,
    queryFn: async () => (await getUserTypes()).data.userTypes,
    staleTime: 5 * 60 * 1000,
  });

export const useUserRoles = () =>
  useQuery({
    queryKey: UserAccountsQueryKeys.roles,
    queryFn: async () => (await getUserRoles()).data.roles,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateUserAccount = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async (model: UserAccountSaveRequest) => (await createUserAccount(model)).data,
    onSuccess: invalidateUsers,
    onError: (err) => exceptionLogger.captureException(err),
  });
};

export const useUpdateUserAccount = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ userId, model }: { userId: number; model: UserAccountSaveRequest }) =>
      (await updateUserAccount(userId, model)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(UserAccountsQueryKeys.detail(data.id), data);
      invalidateUsers();
    },
    onError: (err) => exceptionLogger.captureException(err),
  });
};

export const useDeleteUserAccount = () =>
  useMutation({
    mutationFn: async (userId: number) => {
      await deleteUserAccount(userId);
    },
    onSuccess: invalidateUsers,
  });

export const useUserAccountPasskeys = (userId: number | null, enabled = true) =>
  useQuery({
    queryKey: UserAccountsQueryKeys.passkeys(userId ?? 0),
    queryFn: async () => (await getUserAccountPasskeys(userId ?? 0)).data.passkeys,
    enabled: enabled && !!userId,
  });

export const useDeleteUserAccountPasskey = () =>
  useMutation({
    mutationFn: async ({ userId, passkeyId }: { userId: number; passkeyId: number }) =>
      (await deleteUserAccountPasskey(userId, passkeyId)).data.passkeys,
    onSuccess: (passkeys, { userId }) => {
      queryClient.setQueryData(UserAccountsQueryKeys.passkeys(userId), passkeys);
      invalidateUsers();
    },
  });
