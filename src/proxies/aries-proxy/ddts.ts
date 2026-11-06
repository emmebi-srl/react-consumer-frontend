import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Carrier,
  DdtJobLink,
  DdtSaveRequest,
  DdtSignatureKind,
  DdtSearchRequest,
  DeliveryCare,
  DeliveryMethod,
  TransportCausal,
} from '~/types/aries-proxy/ddts';
import {
  addCarrier,
  copyDdtSignaturesFromReport,
  getDdtAvailableDocuments,
  getDdtJobRemaining,
  getDdtSignature,
  removeDdtSignature,
  searchDdtJobLots,
  setDdtDriverSignatureFromEmployee,
  addDeliveryCare,
  addDeliveryMethod,
  addTransportCausal,
  createDdt,
  deleteCarrier,
  deleteDdt,
  deleteDeliveryCare,
  deleteDeliveryMethod,
  deleteTransportCausal,
  getCarriers,
  getDdtAspects,
  getDdtById,
  getDdtCustomerSystems,
  getDdtsMetadata,
  getDdtsTotals,
  getDdtStatuses,
  getDeliveryCares,
  getDeliveryMethods,
  getDepotTypes,
  getSupplierDestinations,
  getTransportCausals,
  saveCarrier,
  saveDdt,
  saveDeliveryCare,
  saveDeliveryMethod,
  saveTransportCausal,
  searchDdts,
} from './api/ddts';

const DdtSearchPageSize = 50;

export const DdtQueryKeys = {
  all: ['Ddts'] as const,
  search: (params?: DdtSearchRequest) => ['Ddts', 'search', params ?? {}] as const,
  metadata: (params?: DdtSearchRequest) => ['Ddts', 'metadata', params ?? {}] as const,
  totals: (params?: DdtSearchRequest) => ['Ddts', 'totals', params ?? {}] as const,
  byId: (year: number, id: number) => ['Ddts', 'detail', year, id] as const,
  statuses: ['DdtStatuses'] as const,
  /** Every support table shares the prefix, so a change refreshes them all. */
  lookups: ['DdtLookups'] as const,
  causals: (all: boolean) => ['DdtLookups', 'causals', all] as const,
  deliveryMethods: ['DdtLookups', 'delivery-methods'] as const,
  deliveryCares: ['DdtLookups', 'delivery-cares'] as const,
  carriers: ['DdtLookups', 'carriers'] as const,
  depotTypes: ['DdtLookups', 'depot-types'] as const,
  aspects: ['DdtLookups', 'aspects'] as const,
  supplierDestinations: (supplierId: number) => ['DdtLookups', 'supplier-destinations', supplierId] as const,
  customerSystems: (customerId: number) => ['DdtLookups', 'customer-systems', customerId] as const,
  jobLots: (customerId: number, search: string) => ['DdtJobLots', customerId, search] as const,
  jobRemaining: (lot: string, codes: string, ddt: string) => ['DdtJobRemaining', lot, codes, ddt] as const,
  documents: (customerId: number, lot: string) => ['DdtDocuments', customerId, lot] as const,
  signature: (year: number, id: number, kind: DdtSignatureKind) => ['Ddts', 'signature', year, id, kind] as const,
};

const DdtDetailIncludes = 'customer,supplier,status,causal,destination,system,rows,report_links,job_link,pick_lists';

export const useDdtsSearch = (params?: DdtSearchRequest) => {
  const pageSize = params?.pageSize ?? DdtSearchPageSize;
  return useInfiniteQuery({
    queryKey: DdtQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const res = await searchDdts({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.ddts.length < pageSize ? undefined : data.pageIndex + 1),
  });
};

export const useDdtsMetadata = (params?: DdtSearchRequest) => {
  return useQuery({
    queryKey: DdtQueryKeys.metadata(params),
    queryFn: async () => (await getDdtsMetadata(params)).data,
  });
};

export const useDdtsTotals = (params?: DdtSearchRequest, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: DdtQueryKeys.totals(params),
    queryFn: async () => (await getDdtsTotals(params)).data,
    enabled: options?.enabled ?? true,
  });
};

export const useDdtById = (year?: number, id?: number) => {
  return useQuery({
    queryKey: DdtQueryKeys.byId(year ?? 0, id ?? 0),
    queryFn: async () => (await getDdtById(year as number, id as number, DdtDetailIncludes)).data.ddts.at(0) ?? null,
    enabled: !!year && !!id,
  });
};

export const useDdtStatuses = () => {
  return useQuery({
    queryKey: DdtQueryKeys.statuses,
    queryFn: async () => (await getDdtStatuses()).data,
  });
};

export const useTransportCausals = (all = false) => {
  return useQuery({
    queryKey: DdtQueryKeys.causals(all),
    queryFn: async () => (await getTransportCausals(all)).data,
  });
};

export const useDeliveryMethods = () => {
  return useQuery({ queryKey: DdtQueryKeys.deliveryMethods, queryFn: async () => (await getDeliveryMethods()).data });
};

export const useDeliveryCares = () => {
  return useQuery({ queryKey: DdtQueryKeys.deliveryCares, queryFn: async () => (await getDeliveryCares()).data });
};

export const useCarriers = () => {
  return useQuery({ queryKey: DdtQueryKeys.carriers, queryFn: async () => (await getCarriers()).data });
};

export const useDepotTypes = () => {
  return useQuery({ queryKey: DdtQueryKeys.depotTypes, queryFn: async () => (await getDepotTypes()).data });
};

export const useDdtAspects = () => {
  return useQuery({ queryKey: DdtQueryKeys.aspects, queryFn: async () => (await getDdtAspects()).data });
};

export const useSupplierDestinations = (supplierId?: number | null) => {
  return useQuery({
    queryKey: DdtQueryKeys.supplierDestinations(supplierId ?? 0),
    queryFn: async () => (await getSupplierDestinations(supplierId as number)).data.destinations,
    enabled: !!supplierId,
  });
};

export const useDdtCustomerSystems = (customerId?: number | null) => {
  return useQuery({
    queryKey: DdtQueryKeys.customerSystems(customerId ?? 0),
    queryFn: async () => (await getDdtCustomerSystems(customerId as number)).data.systems,
    enabled: !!customerId,
  });
};

/** A saved or deleted DDT refreshes the list, the totals and the detail. */
const useDdtMutation = <TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DdtQueryKeys.all }),
  });
};

export const useCreateDdt = () =>
  useDdtMutation(async (data: DdtSaveRequest) => (await createDdt(data)).data.ddts.at(0) ?? null);

export const useSaveDdt = () =>
  useDdtMutation(
    async ({ year, id, data }: { year: number; id: number; data: DdtSaveRequest }) =>
      (await saveDdt(year, id, data)).data.ddts.at(0) ?? null,
  );

export const useDeleteDdt = () =>
  useDdtMutation(async ({ year, id }: { year: number; id: number }) => {
    await deleteDdt(year, id);
  });

const useLookupMutation = <TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DdtQueryKeys.lookups }),
  });
};

export const useSaveTransportCausal = () =>
  useLookupMutation(async ({ data, isNew }: { data: TransportCausal; isNew: boolean }) =>
    isNew ? addTransportCausal(data) : saveTransportCausal(data),
  );
export const useDeleteTransportCausal = () => useLookupMutation((id: string) => deleteTransportCausal(id));

export const useSaveDeliveryMethod = () =>
  useLookupMutation((data: DeliveryMethod) => (data.id ? saveDeliveryMethod(data) : addDeliveryMethod(data)));
export const useDeleteDeliveryMethod = () => useLookupMutation((id: number) => deleteDeliveryMethod(id));

export const useSaveDeliveryCare = () =>
  useLookupMutation((data: DeliveryCare) => (data.id ? saveDeliveryCare(data) : addDeliveryCare(data)));
export const useDeleteDeliveryCare = () => useLookupMutation((id: number) => deleteDeliveryCare(id));

export const useSaveCarrier = () =>
  useLookupMutation((data: Carrier) => (data.id ? saveCarrier(data) : addCarrier(data)));
export const useDeleteCarrier = () => useLookupMutation((id: number) => deleteCarrier(id));

const lotKey = (lot?: DdtJobLink | null) => (lot ? `${lot.jobId}/${lot.jobYear}/${lot.subJobId}/${lot.lotId}` : '');

export const useDdtJobLots = (customerId: number | null | undefined, search: string) => {
  return useQuery({
    queryKey: DdtQueryKeys.jobLots(customerId ?? 0, search),
    queryFn: async () => (await searchDdtJobLots(customerId, search)).data.lots,
    enabled: !!customerId,
  });
};

/** Remaining quantity of each product code in the lot; -1 when the product is not in the lot. */
export const useDdtJobRemaining = (
  lot: DdtJobLink | null | undefined,
  productCodes: string[],
  ddtId?: number,
  ddtYear?: number,
) => {
  const codes = [...new Set(productCodes)].sort();
  return useQuery({
    queryKey: DdtQueryKeys.jobRemaining(lotKey(lot), codes.join(','), ddtId ? `${ddtId}/${ddtYear ?? 0}` : ''),
    queryFn: async () => {
      const items = (await getDdtJobRemaining(lot as DdtJobLink, codes, ddtId, ddtYear)).data.items;
      return Object.fromEntries(items.map((i) => [i.productCode.toUpperCase(), i.remaining]));
    },
    enabled: !!lot && codes.length > 0,
  });
};

export const useDdtAvailableDocuments = (
  customerId: number | null | undefined,
  lot: DdtJobLink | null | undefined,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: DdtQueryKeys.documents(customerId ?? 0, lotKey(lot)),
    queryFn: async () => (await getDdtAvailableDocuments(customerId as number, lot)).data.documents,
    enabled: enabled && !!customerId,
  });
};

/** Object URL of the signature JPEG, null when the DDT has none. */
export const useDdtSignature = (year: number, id: number, kind: DdtSignatureKind, enabled: boolean) => {
  return useQuery({
    queryKey: DdtQueryKeys.signature(year, id, kind),
    queryFn: async () => {
      const res = await getDdtSignature(year, id, kind);
      return URL.createObjectURL(new Blob([res.data], { type: 'image/jpeg' }));
    },
    enabled,
    retry: false,
    staleTime: Infinity,
  });
};

export const useCopyDdtSignaturesFromReport = () =>
  useDdtMutation(
    async ({ year, id, reportId, reportYear }: { year: number; id: number; reportId: number; reportYear: number }) =>
      copyDdtSignaturesFromReport(year, id, reportId, reportYear),
  );

export const useSetDdtDriverSignatureFromEmployee = () =>
  useDdtMutation(async ({ year, id, employeeId }: { year: number; id: number; employeeId: number }) =>
    setDdtDriverSignatureFromEmployee(year, id, employeeId),
  );

export const useRemoveDdtSignature = () =>
  useDdtMutation(async ({ year, id, kind }: { year: number; id: number; kind: DdtSignatureKind }) =>
    removeDdtSignature(year, id, kind),
  );
