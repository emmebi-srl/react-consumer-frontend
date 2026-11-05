import ariesServicesClient from '~/clients/aries-services-client';
import { UserModulePermissionsResponse, UsersResponse } from '~/types/aries-proxy/users';

export const getUserMe = () => {
  return ariesServicesClient.get<UsersResponse>('user/me');
};

export const getUserModulePermissions = () => {
  return ariesServicesClient.get<UserModulePermissionsResponse>('user/me/permissions');
};

export const logout = () => {
  return ariesServicesClient.post('user/logout');
};
