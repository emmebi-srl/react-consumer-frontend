import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import { System, SystemResponse, SystemSearchRequest } from '~/types/aries-proxy/systems';

type SystemApiResponse = System[] | SystemResponse;

const normalizeSystemResponse = (data: SystemApiResponse): SystemResponse => {
  return Array.isArray(data) ? { systems: data } : data;
};

export const getSystems = async (req?: SystemSearchRequest) => {
  const response = await ariesServicesClient.get<SystemApiResponse>('system', {
    params: req,
  });

  return {
    ...response,
    data: normalizeSystemResponse(response.data),
  };
};

export const getSystemsMetadata = (req?: SystemSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('system/metadata', {
    params: req,
  });
};
