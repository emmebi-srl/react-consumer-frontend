import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  Customer,
  CustomerList,
  CustomerSearchRequest,
  CustomerStatusList,
  CustomerTypeList,
} from '~/types/aries-proxy/customers';

export const getCustomers = () => {
  return ariesServicesClient.get<Customer[]>('customer');
};

export const getCustomersForMobileSync = () => {
  return ariesServicesClient.get<Customer[]>('customer/mobile-sync');
};

export const searchCustomers = (req: CustomerSearchRequest) => {
  return ariesServicesClient.get<CustomerList>('customer/search', { params: req });
};

export const getCustomersMetadata = (req: CustomerSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('customer/metadata', { params: req });
};

export const getCustomerById = (id: number, options?: { includes?: string }) => {
  return ariesServicesClient.get<CustomerList>(`customer/${id}`, { params: options });
};

export const getCustomerTypes = () => {
  return ariesServicesClient.get<CustomerTypeList>('customer/type');
};

export const getCustomerStatuses = () => {
  return ariesServicesClient.get<CustomerStatusList>('customer/status');
};
