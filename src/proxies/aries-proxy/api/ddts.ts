import ariesServicesClient from '~/clients/aries-services-client';
import {
  Carrier,
  CarrierList,
  DdtAspects,
  DdtDocumentList,
  DdtDocumentType,
  DdtImport,
  DdtJobLink,
  DdtJobLotList,
  DdtJobRemainingList,
  DdtSignatureKind,
  DdtList,
  DdtProductDefaults,
  DdtSaveRequest,
  DdtSearchRequest,
  DdtStatusList,
  DdtSystemList,
  DdtTotals,
  DeliveryCare,
  DeliveryCareList,
  DeliveryMethod,
  DeliveryMethodList,
  DepotTypeList,
  SupplierDestinationList,
  TransportCausal,
  TransportCausalList,
} from '~/types/aries-proxy/ddts';
import { SearchMetadata } from '~/types/aries-proxy/shared';

/** Newest first: by year, then by number. */
export const searchDdts = (req?: DdtSearchRequest) => {
  return ariesServicesClient.get<DdtList>('ddt', { params: req });
};

export const getDdtsMetadata = (req?: DdtSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('ddt/metadata', { params: req });
};

/** Requires the totals permission of the DDT module. */
export const getDdtsTotals = (req?: DdtSearchRequest) => {
  return ariesServicesClient.get<DdtTotals>('ddt/totals', { params: req });
};

export const getDdtById = (year: number, id: number, includes?: string) => {
  return ariesServicesClient.get<DdtList>(`ddt/${year}/${id}`, { params: { includes } });
};

export const createDdt = (data: DdtSaveRequest) => {
  return ariesServicesClient.post<DdtList>('ddt', data);
};

/** A different ddtNumber, or a date in another year, renumbers the DDT: the response has the new number. */
export const saveDdt = (year: number, id: number, data: DdtSaveRequest) => {
  return ariesServicesClient.put<DdtList>(`ddt/${year}/${id}`, data);
};

export const deleteDdt = (year: number, id: number) => {
  return ariesServicesClient.delete(`ddt/${year}/${id}`);
};

/** ArrayBuffer: the client response interceptor would mangle a Blob. */
export const getDdtPdf = (year: number, id: number) => {
  return ariesServicesClient.get<ArrayBuffer>(`ddt/${year}/${id}/pdf`, { responseType: 'arraybuffer' });
};

/** Query params are not mapped by the client: the keys are the ones the API binds. */
export const getDdtProductDefaults = (productCode: string, depotId?: number | null, customerId?: number | null) => {
  return ariesServicesClient.get<DdtProductDefaults>('ddt/product-defaults', {
    params: { productCode, depotId: depotId ?? undefined, customerId: customerId ?? undefined },
  });
};

export const getSupplierDestinations = (supplierId: number) => {
  return ariesServicesClient.get<SupplierDestinationList>(`ddt/supplier/${supplierId}/destinations`);
};

export const getDdtCustomerSystems = (customerId: number) => {
  return ariesServicesClient.get<DdtSystemList>(`ddt/customer/${customerId}/systems`);
};

export const getDdtStatuses = () => {
  return ariesServicesClient.get<DdtStatusList>('ddt/status');
};

export const getDdtAspects = () => {
  return ariesServicesClient.get<DdtAspects>('ddt/aspect');
};

export const getDepotTypes = () => {
  return ariesServicesClient.get<DepotTypeList>('ddt/depot-type');
};

/** all: also the closed causals and those of the received DDTs (settings page). */
export const getTransportCausals = (all = false) => {
  return ariesServicesClient.get<TransportCausalList>('ddt/causal', { params: all ? { all: true } : undefined });
};

export const addTransportCausal = (data: TransportCausal) => {
  return ariesServicesClient.post<TransportCausalList>('ddt/causal', data);
};

export const saveTransportCausal = (data: TransportCausal) => {
  return ariesServicesClient.put<TransportCausalList>(`ddt/causal/${encodeURIComponent(data.id)}`, data);
};

export const deleteTransportCausal = (id: string) => {
  return ariesServicesClient.delete(`ddt/causal/${encodeURIComponent(id)}`);
};

export const getDeliveryMethods = () => {
  return ariesServicesClient.get<DeliveryMethodList>('ddt/delivery-method');
};

export const addDeliveryMethod = (data: DeliveryMethod) => {
  return ariesServicesClient.post<DeliveryMethodList>('ddt/delivery-method', data);
};

export const saveDeliveryMethod = (data: DeliveryMethod) => {
  return ariesServicesClient.put<DeliveryMethodList>(`ddt/delivery-method/${data.id}`, data);
};

export const deleteDeliveryMethod = (id: number) => {
  return ariesServicesClient.delete(`ddt/delivery-method/${id}`);
};

export const getDeliveryCares = () => {
  return ariesServicesClient.get<DeliveryCareList>('ddt/delivery-care');
};

export const addDeliveryCare = (data: DeliveryCare) => {
  return ariesServicesClient.post<DeliveryCareList>('ddt/delivery-care', data);
};

export const saveDeliveryCare = (data: DeliveryCare) => {
  return ariesServicesClient.put<DeliveryCareList>(`ddt/delivery-care/${data.id}`, data);
};

export const deleteDeliveryCare = (id: number) => {
  return ariesServicesClient.delete(`ddt/delivery-care/${id}`);
};

export const getCarriers = () => {
  return ariesServicesClient.get<CarrierList>('ddt/carrier');
};

export const addCarrier = (data: Carrier) => {
  return ariesServicesClient.post<CarrierList>('ddt/carrier', data);
};

export const saveCarrier = (data: Carrier) => {
  return ariesServicesClient.put<CarrierList>(`ddt/carrier/${data.id}`, data);
};

export const deleteCarrier = (id: number) => {
  return ariesServicesClient.delete(`ddt/carrier/${id}`);
};

/** Lots of the open jobs, of the customer when given. */
export const searchDdtJobLots = (customerId?: number | null, search?: string) => {
  return ariesServicesClient.get<DdtJobLotList>('ddt/job-lots', {
    params: { customerId: customerId ?? undefined, search: search || undefined },
  });
};

/** What is left to bring of each product; the saved rows of ddtId/ddtYear are given back when it is on the same lot. */
export const getDdtJobRemaining = (lot: DdtJobLink, productCodes: string[], ddtId?: number, ddtYear?: number) => {
  return ariesServicesClient.get<DdtJobRemainingList>('ddt/job-remaining', {
    params: {
      jobId: lot.jobId,
      jobYear: lot.jobYear,
      subJobId: lot.subJobId,
      lotId: lot.lotId,
      productCodes: productCodes.join(','),
      ddtId,
      ddtYear,
    },
  });
};

/** Reports and pick lists of the customer not in a DDT yet; with a lot only its reports. */
export const getDdtAvailableDocuments = (customerId: number, lot?: DdtJobLink | null) => {
  return ariesServicesClient.get<DdtDocumentList>('ddt/documents', {
    params: {
      customerId,
      jobId: lot?.jobId,
      jobYear: lot?.jobYear,
      subJobId: lot?.subJobId,
      lotId: lot?.lotId,
    },
  });
};

export const importDdtDocument = (type: DdtDocumentType, year: number, id: number) => {
  return ariesServicesClient.get<DdtImport>(`ddt/documents/${type}/${year}/${id}`);
};

/** ArrayBuffer: the client response interceptor would mangle a Blob. */
export const getDdtSignature = (year: number, id: number, kind: DdtSignatureKind) => {
  return ariesServicesClient.get<ArrayBuffer>(`ddt/${year}/${id}/signature/${kind}`, { responseType: 'arraybuffer' });
};

export const copyDdtSignaturesFromReport = (year: number, id: number, reportId: number, reportYear: number) => {
  return ariesServicesClient.post<DdtList>(`ddt/${year}/${id}/signature/from-report`, { reportId, reportYear });
};

export const setDdtDriverSignatureFromEmployee = (year: number, id: number, employeeId: number) => {
  return ariesServicesClient.post<DdtList>(`ddt/${year}/${id}/signature/driver/employee/${employeeId}`);
};

export const removeDdtSignature = (year: number, id: number, kind: DdtSignatureKind) => {
  return ariesServicesClient.delete<DdtList>(`ddt/${year}/${id}/signature/${kind}`);
};
