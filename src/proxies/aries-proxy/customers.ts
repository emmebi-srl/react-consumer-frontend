import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  getCustomerById,
  getCustomerStatuses,
  getCustomerTypes,
  getCustomers,
  getCustomersMetadata,
  searchCustomers,
  updateCustomer,
  updateCustomerMainContact,
  updateCustomerMainDestination,
} from './api/customers';
import {
  CustomerContactUpdateRequest,
  CustomerDestinationUpdateRequest,
  CustomerSearchRequest,
  CustomerUpdateRequest,
} from '~/types/aries-proxy/customers';

const CustomerSearchPageSize = 50;

export const CustomersQueryKeys = {
  all: ['Customers'] as const,
  search: (params: CustomerSearchRequest) => ['Customers', 'search', params] as const,
  metadata: (params: CustomerSearchRequest) => ['Customers', 'metadata', params] as const,
  byId: (id: number) => ['Customer', id] as const,
  types: ['CustomerTypes'] as const,
  statuses: ['CustomerStatuses'] as const,
};

export const useCustomers = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.all,
    queryFn: async () => (await getCustomers()).data,
  });
};

export const useCustomersSearch = (params: CustomerSearchRequest) => {
  return useInfiniteQuery({
    queryKey: CustomersQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = params.pageSize ?? CustomerSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const res = await searchCustomers({
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
      if (data.customers.length < (params.pageSize ?? CustomerSearchPageSize)) {
        return undefined;
      }

      const args = data.pageParam;
      return (Number(args.pageIndex) + 1).toString();
    },
  });
};

export const useCustomersMetadata = (params: CustomerSearchRequest) => {
  return useQuery({
    queryKey: CustomersQueryKeys.metadata(params),
    queryFn: async () => (await getCustomersMetadata(params)).data,
  });
};

export const useCustomerById = (id: number, options?: { includes?: string }) => {
  return useQuery({
    queryKey: CustomersQueryKeys.byId(id),
    queryFn: async () => (await getCustomerById(id, options)).data,
    enabled: !!id,
  });
};

export const useCustomerTypes = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.types,
    queryFn: async () => (await getCustomerTypes()).data,
  });
};

export const useCustomerStatuses = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.statuses,
    queryFn: async () => (await getCustomerStatuses()).data,
  });
};

export const useUpdateCustomer = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CustomerUpdateRequest }) =>
      (await updateCustomer(id, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.id) }),
        queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.all }),
      ]),
  });
};

export const useUpdateCustomerMainContact = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, data }: { customerId: number; data: CustomerContactUpdateRequest }) =>
      (await updateCustomerMainContact(customerId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};

export const useUpdateCustomerMainDestination = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, data }: { customerId: number; data: CustomerDestinationUpdateRequest }) =>
      (await updateCustomerMainDestination(customerId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};
