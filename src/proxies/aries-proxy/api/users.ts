import ariesServicesClient from '~/clients/aries-services-client';
import { UsersResponse } from '~/types/aries-proxy/users';

export const getUserMe = () => {
  return ariesServicesClient.get<UsersResponse>('user/me');
};

export const logout = () => {
  return ariesServicesClient.post('user/logout');
};
