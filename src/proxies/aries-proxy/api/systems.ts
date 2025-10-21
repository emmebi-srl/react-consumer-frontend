import ariesServicesClient from '~/clients/aries-services-client';
import { SystemResponse } from '~/types/aries-proxy/systems';

export const searchSystems = (value: string) => {
  return ariesServicesClient.get<SystemResponse>('system/search', {
    params: {
      value,
      fields: 'description,company_name,system_id',
    },
  });
};
