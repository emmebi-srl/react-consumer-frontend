import ariesServicesClient from '~/clients/aries-services-client';
import {
  PasskeyCeremony,
  UserAccount,
  UserModulePermissionsResponse,
  UserPasskeyListResponse,
  UserPasswordChangeRequest,
  UserProfileSaveRequest,
  UsersResponse,
} from '~/types/aries-proxy/users';

// Own profile and passkeys: the server always acts on the user of the token.

export const getMyAccount = () => ariesServicesClient.get<UserAccount>('user/me/account');

export const saveMyAccount = (model: UserProfileSaveRequest) =>
  ariesServicesClient.put<UserAccount>('user/me/account', model);

export const changeMyPassword = (model: UserPasswordChangeRequest) =>
  ariesServicesClient.post('user/me/password', model);

export const getMyPasskeys = () => ariesServicesClient.get<UserPasskeyListResponse>('user/me/passkey');

export const startPasskeyRegistration = () => ariesServicesClient.post<PasskeyCeremony>('user/me/passkey/options');

/** `credentialJson` is the browser RegistrationResponseJSON as a string, so the client doesn't rename its keys. */
export const addMyPasskey = (model: { ceremonyId: string; name: string; credentialJson: string }) =>
  ariesServicesClient.post<UserPasskeyListResponse>('user/me/passkey', model);

export const renameMyPasskey = (passkeyId: number, name: string) =>
  ariesServicesClient.patch<UserPasskeyListResponse>(`user/me/passkey/${passkeyId}`, { name });

export const deleteMyPasskey = (passkeyId: number) =>
  ariesServicesClient.delete<UserPasskeyListResponse>(`user/me/passkey/${passkeyId}`);

export const getUserMe = () => {
  return ariesServicesClient.get<UsersResponse>('user/me');
};

export const getUserModulePermissions = () => {
  return ariesServicesClient.get<UserModulePermissionsResponse>('user/me/permissions');
};

export const logout = () => {
  return ariesServicesClient.post('user/logout');
};
