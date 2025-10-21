import ariesServicesClient from '~/clients/aries-services-client';
import { WorksResponse } from '~/types/aries-proxy/works';

export interface WorksToDoByAddressFilter {
  city: string;
  address: string;
  distance: number;
  postalCode: string;
}

export const getWorksToDoByAddress = ({ city, address, distance, postalCode }: WorksToDoByAddressFilter) => {
  return ariesServicesClient.get<WorksResponse>('work/todo/address', {
    params: { city, address, distance, postalCode },
  });
};
