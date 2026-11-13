import ariesServicesClient from '~/clients/aries-services-client';
import {
  UserAccount,
  UserAccountListResponse,
  UserAccountSaveRequest,
  UserPasskeyListResponse,
  UserRoleOption,
  UserType,
} from '~/types/aries-proxy/users';

// Users management, admin only (`aries_admin`). Not `user`: its GET is the legacy list of the Android app.
const BASE = 'user-account';

export const getUserAccounts = () => ariesServicesClient.get<UserAccountListResponse>(BASE);

export const getUserAccount = (userId: number) => ariesServicesClient.get<UserAccount>(`${BASE}/${userId}`);

export const createUserAccount = (model: UserAccountSaveRequest) => ariesServicesClient.post<UserAccount>(BASE, model);

export const updateUserAccount = (userId: number, model: UserAccountSaveRequest) =>
  ariesServicesClient.put<UserAccount>(`${BASE}/${userId}`, model);

export const deleteUserAccount = (userId: number) => ariesServicesClient.delete(`${BASE}/${userId}`);

export const getUserTypes = () => ariesServicesClient.get<{ userTypes: UserType[] }>(`${BASE}/type`);

export const getUserRoles = () => ariesServicesClient.get<{ roles: UserRoleOption[] }>(`${BASE}/role`);

export const getUserAccountPasskeys = (userId: number) =>
  ariesServicesClient.get<UserPasskeyListResponse>(`${BASE}/${userId}/passkey`);

export const deleteUserAccountPasskey = (userId: number, passkeyId: number) =>
  ariesServicesClient.delete<UserPasskeyListResponse>(`${BASE}/${userId}/passkey/${passkeyId}`);
