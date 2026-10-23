import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  Customer,
  CustomerContact,
  CustomerContactCreateRequest,
  CustomerContactFigureList,
  CustomerCreateRequest,
  CustomerContactUpdateRequest,
  CustomerDestination,
  CustomerDestinationCreateRequest,
  CustomerDestinationUpdateRequest,
  CustomerList,
  CustomerSearchRequest,
  CustomerStatusList,
  CustomerTypeList,
  CustomerSaveRequest,
  CustomerRelationshipTypeList,
  CustomerActivityTypeList,
  CustomerPaymentConditionList,
  CustomerAgentList,
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

export const createCustomer = (model: CustomerCreateRequest) => {
  return ariesServicesClient.post<CustomerList>('customer', model);
};

export const updateCustomer = (id: number, model: CustomerSaveRequest) => {
  return ariesServicesClient.patch<CustomerList>(`customer/${id}`, model);
};

export const updateCustomerMainContact = (customerId: number, model: CustomerContactUpdateRequest) => {
  return ariesServicesClient.patch<CustomerContact>(`customer/${customerId}/contact/main`, model);
};

export const updateCustomerMainDestination = (customerId: number, model: CustomerDestinationUpdateRequest) => {
  return ariesServicesClient.patch<CustomerDestination>(`customer/${customerId}/destination/main`, model);
};

export const updateCustomerContact = (customerId: number, contactId: number, model: CustomerContactUpdateRequest) => {
  return ariesServicesClient.patch<CustomerContact>(`customer/${customerId}/contact/${contactId}`, model);
};

export const updateCustomerDestination = (
  customerId: number,
  destinationId: number,
  model: CustomerDestinationUpdateRequest,
) => {
  return ariesServicesClient.patch<CustomerDestination>(`customer/${customerId}/destination/${destinationId}`, model);
};

export const createCustomerContact = (customerId: number, model: CustomerContactCreateRequest) => {
  return ariesServicesClient.post<CustomerContact>(`customer/${customerId}/contact`, model);
};

export const deleteCustomerContact = (customerId: number, contactId: number) => {
  return ariesServicesClient.delete(`customer/${customerId}/contact/${contactId}`);
};

export const createCustomerDestination = (customerId: number, model: CustomerDestinationCreateRequest) => {
  return ariesServicesClient.post<CustomerDestination>(`customer/${customerId}/destination`, model);
};

export const deleteCustomerDestination = (customerId: number, destinationId: number) => {
  return ariesServicesClient.delete(`customer/${customerId}/destination/${destinationId}`);
};

export const getCustomerTypes = () => {
  return ariesServicesClient.get<CustomerTypeList>('customer/type');
};

export const getCustomerStatuses = () => {
  return ariesServicesClient.get<CustomerStatusList>('customer/status');
};

export const getCustomerRelationshipTypes = () => {
  return ariesServicesClient.get<CustomerRelationshipTypeList>('customer/relationship-type');
};

export const getCustomerActivityTypes = () => {
  return ariesServicesClient.get<CustomerActivityTypeList>('customer/activity-type');
};

export const getCustomerPaymentConditions = () => {
  return ariesServicesClient.get<CustomerPaymentConditionList>('customer/payment-condition');
};

export const getCustomerAgents = () => {
  return ariesServicesClient.get<CustomerAgentList>('customer/agent');
};

export const getCustomerContactFigures = () => {
  return ariesServicesClient.get<CustomerContactFigureList>('customer/contact/figure');
};
