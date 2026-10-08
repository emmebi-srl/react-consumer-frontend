import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  Customer,
  CustomerContact,
  CustomerContactUpdateRequest,
  CustomerDestination,
  CustomerDestinationUpdateRequest,
  CustomerList,
  CustomerSearchRequest,
  CustomerStatusList,
  CustomerTypeList,
  CustomerUpdateRequest,
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

export const updateCustomer = (id: number, model: CustomerUpdateRequest) => {
  return ariesServicesClient.patch<CustomerList>(`customer/${id}`, model);
};

export const updateCustomerMainContact = (customerId: number, model: CustomerContactUpdateRequest) => {
  return ariesServicesClient.patch<CustomerContact>(`customer/${customerId}/contact/main`, model);
};

export const updateCustomerMainDestination = (customerId: number, model: CustomerDestinationUpdateRequest) => {
  return ariesServicesClient.patch<CustomerDestination>(`customer/${customerId}/destination/main`, model);
};

export const getCustomerTypes = () => {
  return ariesServicesClient.get<CustomerTypeList>('customer/type');
};

export const getCustomerStatuses = () => {
  return ariesServicesClient.get<CustomerStatusList>('customer/status');
};
