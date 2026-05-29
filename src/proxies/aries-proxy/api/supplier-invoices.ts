import ariesServicesClient from '~/clients/aries-services-client';
import {
  SupplierInvoiceCausalList,
  SupplierInvoiceList,
  SupplierInvoicePeriodicConfigurationCreateRequest,
  SupplierInvoicePeriodicConfigurationList,
  SupplierInvoicePeriodicConfigurationSearchRequest,
  SupplierInvoicePeriodicConfigurationUpdateRequest,
  SupplierInvoiceSearchRequest,
  SupplierInvoiceStatusList,
  SupplierInvoiceTypeList,
} from '~/types/aries-proxy/supplier-invoices';
import { SearchMetadata } from '~/types/aries-proxy/shared';

export const getSupplierInvoices = (req: SupplierInvoiceSearchRequest) => {
  return ariesServicesClient.get<SupplierInvoiceList>('supplier-invoice', { params: req });
};

export const getSupplierInvoicesMetadata = (req: SupplierInvoiceSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('supplier-invoice/metadata', { params: req });
};

export const getSupplierInvoiceById = (year: number, id: number, options?: { includes?: string }) => {
  return ariesServicesClient.get<SupplierInvoiceList>(`supplier-invoice/${year}/${id}`, { params: options });
};

export const getSupplierInvoiceStatuses = () => {
  return ariesServicesClient.get<SupplierInvoiceStatusList>('supplier-invoice/status');
};

export const getSupplierInvoiceTypes = () => {
  return ariesServicesClient.get<SupplierInvoiceTypeList>('supplier-invoice/type');
};

export const getSupplierInvoiceCausals = () => {
  return ariesServicesClient.get<SupplierInvoiceCausalList>('supplier-invoice/causal');
};

export const getSupplierInvoicePeriodicConfigurations = (req?: SupplierInvoicePeriodicConfigurationSearchRequest) => {
  return ariesServicesClient.get<SupplierInvoicePeriodicConfigurationList>('supplier-invoice/periodic-configuration', {
    params: req,
  });
};

export const createSupplierInvoicePeriodicConfiguration = (
  model: SupplierInvoicePeriodicConfigurationCreateRequest,
) => {
  return ariesServicesClient.post<SupplierInvoicePeriodicConfigurationList>(
    'supplier-invoice/periodic-configuration',
    model,
  );
};

export const updateSupplierInvoicePeriodicConfiguration = (
  id: number,
  model: SupplierInvoicePeriodicConfigurationUpdateRequest,
) => {
  return ariesServicesClient.patch<SupplierInvoicePeriodicConfigurationList>(
    `supplier-invoice/periodic-configuration/${id}`,
    model,
  );
};

export const deleteSupplierInvoicePeriodicConfiguration = (id: number) => {
  return ariesServicesClient.delete(`supplier-invoice/periodic-configuration/${id}`);
};
