import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSupplierInvoicePeriodicConfiguration,
  deleteSupplierInvoicePeriodicConfiguration,
  getSupplierInvoiceById,
  getSupplierInvoiceCausals,
  getSupplierInvoicePeriodicConfigurations,
  getSupplierInvoiceStatuses,
  getSupplierInvoiceTypes,
  getSupplierInvoices,
  getSupplierInvoicesMetadata,
  updateSupplierInvoicePeriodicConfiguration,
} from './api/supplier-invoices';
import {
  SupplierInvoicePeriodicConfigurationCreateRequest,
  SupplierInvoicePeriodicConfigurationSearchRequest,
  SupplierInvoicePeriodicConfigurationUpdateRequest,
  SupplierInvoiceSearchRequest,
} from '~/types/aries-proxy/supplier-invoices';

const SupplierInvoiceSearchPageSize = 50;

export const SupplierInvoiceQueryKeys = {
  all: ['SupplierInvoices'] as const,
  search: (params: SupplierInvoiceSearchRequest) => ['SupplierInvoices', 'search', params] as const,
  metadata: (params: SupplierInvoiceSearchRequest) => ['SupplierInvoices', 'metadata', params] as const,
  byId: (year: number, id: number) => ['SupplierInvoice', year, id] as const,
  statuses: ['SupplierInvoiceStatuses'] as const,
  types: ['SupplierInvoiceTypes'] as const,
  causals: ['SupplierInvoiceCausals'] as const,
  periodicConfigurations: ['SupplierInvoicePeriodicConfigurations'] as const,
  periodicConfigurationsSearch: (params: SupplierInvoicePeriodicConfigurationSearchRequest) =>
    ['SupplierInvoicePeriodicConfigurations', 'search', params] as const,
};

export const useSupplierInvoicesSearch = (params: SupplierInvoiceSearchRequest) => {
  return useInfiniteQuery({
    queryKey: SupplierInvoiceQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = params.pageSize ?? SupplierInvoiceSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const res = await getSupplierInvoices({
        ...params,
        pageIndex,
        pageSize,
      });
      return {
        ...res.data,
        pageParam: {
          pageIndex,
          pageSize,
        },
      };
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      if (data.supplierInvoices.length < (params.pageSize ?? SupplierInvoiceSearchPageSize)) {
        return undefined;
      }

      const args = data.pageParam;
      return (Number(args.pageIndex) + 1).toString();
    },
  });
};

export const useSupplierInvoicesMetadata = (params: SupplierInvoiceSearchRequest) => {
  return useQuery({
    queryKey: SupplierInvoiceQueryKeys.metadata(params),
    queryFn: async () => (await getSupplierInvoicesMetadata(params)).data,
  });
};

export const useSupplierInvoiceById = (year: number, id: number, options?: { includes?: string }) => {
  return useQuery({
    queryKey: SupplierInvoiceQueryKeys.byId(year, id),
    queryFn: async () => (await getSupplierInvoiceById(year, id, options)).data,
    enabled: !!year && !!id,
  });
};

export const useSupplierInvoiceStatuses = () => {
  return useQuery({
    queryKey: SupplierInvoiceQueryKeys.statuses,
    queryFn: async () => (await getSupplierInvoiceStatuses()).data,
  });
};

export const useSupplierInvoiceTypes = () => {
  return useQuery({
    queryKey: SupplierInvoiceQueryKeys.types,
    queryFn: async () => (await getSupplierInvoiceTypes()).data,
  });
};

export const useSupplierInvoiceCausals = () => {
  return useQuery({
    queryKey: SupplierInvoiceQueryKeys.causals,
    queryFn: async () => (await getSupplierInvoiceCausals()).data,
  });
};

export const useSupplierInvoicePeriodicConfigurationsSearch = (
  params: SupplierInvoicePeriodicConfigurationSearchRequest,
) => {
  return useInfiniteQuery({
    queryKey: SupplierInvoiceQueryKeys.periodicConfigurationsSearch(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = params.pageSize ?? SupplierInvoiceSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const res = await getSupplierInvoicePeriodicConfigurations({
        ...params,
        pageIndex,
        pageSize,
      });
      return {
        ...res.data,
        pageParam: {
          pageIndex,
          pageSize,
        },
      };
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      if (data.periodicConfigurations.length < (params.pageSize ?? SupplierInvoiceSearchPageSize)) {
        return undefined;
      }

      const args = data.pageParam;
      return (Number(args.pageIndex) + 1).toString();
    },
  });
};

export const useCreateSupplierInvoicePeriodicConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierInvoicePeriodicConfigurationCreateRequest) =>
      (await createSupplierInvoicePeriodicConfiguration(data)).data,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SupplierInvoiceQueryKeys.periodicConfigurations }),
        queryClient.invalidateQueries({ queryKey: SupplierInvoiceQueryKeys.all }),
      ]),
  });
};

export const useUpdateSupplierInvoicePeriodicConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SupplierInvoicePeriodicConfigurationUpdateRequest }) =>
      (await updateSupplierInvoicePeriodicConfiguration(id, data)).data,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SupplierInvoiceQueryKeys.periodicConfigurations }),
        queryClient.invalidateQueries({ queryKey: SupplierInvoiceQueryKeys.all }),
      ]),
  });
};

export const useDeleteSupplierInvoicePeriodicConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplierInvoicePeriodicConfiguration,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SupplierInvoiceQueryKeys.periodicConfigurations }),
        queryClient.invalidateQueries({ queryKey: SupplierInvoiceQueryKeys.all }),
      ]),
  });
};
