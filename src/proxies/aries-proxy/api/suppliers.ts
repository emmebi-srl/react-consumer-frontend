import ariesServicesClient from '~/clients/aries-services-client';
import { SupplierList, SupplierSearchRequest } from '~/types/aries-proxy/suppliers';

export const getSuppliers = (req?: SupplierSearchRequest) => {
  return ariesServicesClient.get<SupplierList>('supplier', { params: req });
};
