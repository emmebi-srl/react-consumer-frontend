import ariesServicesClient from '~/clients/aries-services-client';
import { Customer } from '~/types/aries-proxy/customers';

export const getCustomers = () => {
  return ariesServicesClient.get<Customer[]>('customer');
};
