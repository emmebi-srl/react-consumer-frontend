import { useMutation, useQuery } from '@tanstack/react-query';
import { startRegistration } from '@simplewebauthn/browser';
import {
  addMyPasskey,
  changeMyPassword,
  deleteMyPasskey,
  getMyAccount,
  getMyPasskeys,
  getUserMe,
  getUserModulePermissions,
  logout,
  renameMyPasskey,
  saveMyAccount,
  startPasskeyRegistration,
} from './api/users';
import queryClient from '~/clients/query-client';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { UserPasskeyListResponse, UserPasswordChangeRequest, UserProfileSaveRequest } from '~/types/aries-proxy/users';

export const UsersQueryKeys = {
  me: ['users', 'me'] as const,
  modulePermissions: ['users', 'me', 'permissions'] as const,
  myAccount: ['users', 'me', 'account'] as const,
  myPasskeys: ['users', 'me', 'passkeys'] as const,
};

// Own profile

export const useMyAccount = () =>
  useQuery({
    queryKey: UsersQueryKeys.myAccount,
    queryFn: async () => (await getMyAccount()).data,
  });

export const useSaveMyAccount = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async (model: UserProfileSaveRequest) => (await saveMyAccount(model)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(UsersQueryKeys.myAccount, data);
      // user/me feeds the sidebar and the email senders.
      void queryClient.invalidateQueries({ queryKey: UsersQueryKeys.me, exact: true });
    },
    onError: (err) => exceptionLogger.captureException(err),
  });
};

export const useChangeMyPassword = () =>
  useMutation({
    mutationFn: async (model: UserPasswordChangeRequest) => {
      await changeMyPassword(model);
    },
  });

// Own passkeys

export const useMyPasskeys = (enabled = true) =>
  useQuery({
    queryKey: UsersQueryKeys.myPasskeys,
    queryFn: async () => (await getMyPasskeys()).data,
    enabled,
  });

const setMyPasskeys = (data: UserPasskeyListResponse) => {
  queryClient.setQueryData(UsersQueryKeys.myPasskeys, data);
  void queryClient.invalidateQueries({ queryKey: UsersQueryKeys.myAccount });
};

/** Asks the browser to create a passkey for the logged-in user, then stores its public key on the server. */
export const useRegisterPasskey = () =>
  useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const ceremony = (await startPasskeyRegistration()).data;
      const credential = await startRegistration({ optionsJSON: JSON.parse(ceremony.optionsJson) });
      return (await addMyPasskey({ ceremonyId: ceremony.ceremonyId, name, credentialJson: JSON.stringify(credential) }))
        .data;
    },
    onSuccess: setMyPasskeys,
  });

export const useRenameMyPasskey = () =>
  useMutation({
    mutationFn: async ({ passkeyId, name }: { passkeyId: number; name: string }) =>
      (await renameMyPasskey(passkeyId, name)).data,
    onSuccess: setMyPasskeys,
  });

export const useDeleteMyPasskey = () =>
  useMutation({
    mutationFn: async (passkeyId: number) => (await deleteMyPasskey(passkeyId)).data,
    onSuccess: setMyPasskeys,
  });

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
