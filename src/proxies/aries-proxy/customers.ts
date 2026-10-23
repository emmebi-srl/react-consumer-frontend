import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  createCustomer,
  createCustomerContact,
  createCustomerDestination,
  deleteCustomerContact,
  deleteCustomerDestination,
  getCustomerActivityTypes,
  getCustomerAgents,
  getCustomerById,
  getCustomerContactFigures,
  getCustomerPaymentConditions,
  getCustomerRelationshipTypes,
  getCustomerStatuses,
  getCustomerTypes,
  getCustomers,
  getCustomersMetadata,
  searchCustomers,
  updateCustomer,
  updateCustomerContact,
  updateCustomerDestination,
  updateCustomerMainContact,
  updateCustomerMainDestination,
} from './api/customers';
import {
  CustomerContactCreateRequest,
  CustomerContactUpdateRequest,
  CustomerCreateRequest,
  CustomerDestinationCreateRequest,
  CustomerDestinationUpdateRequest,
  CustomerSearchRequest,
  CustomerSaveRequest,
} from '~/types/aries-proxy/customers';

const CustomerSearchPageSize = 50;

export const CustomersQueryKeys = {
  all: ['Customers'] as const,
  search: (params: CustomerSearchRequest) => ['Customers', 'search', params] as const,
  metadata: (params: CustomerSearchRequest) => ['Customers', 'metadata', params] as const,
  byId: (id: number) => ['Customer', id] as const,
  types: ['CustomerTypes'] as const,
  statuses: ['CustomerStatuses'] as const,
  contactFigures: ['CustomerContactFigures'] as const,
  relationshipTypes: ['CustomerRelationshipTypes'] as const,
  activityTypes: ['CustomerActivityTypes'] as const,
  paymentConditions: ['CustomerPaymentConditions'] as const,
  agents: ['CustomerAgents'] as const,
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

export const useCustomerRelationshipTypes = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.relationshipTypes,
    queryFn: async () => (await getCustomerRelationshipTypes()).data,
  });
};

export const useCustomerActivityTypes = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.activityTypes,
    queryFn: async () => (await getCustomerActivityTypes()).data,
  });
};

export const useCustomerPaymentConditions = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.paymentConditions,
    queryFn: async () => (await getCustomerPaymentConditions()).data,
  });
};

export const useCustomerAgents = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.agents,
    queryFn: async () => (await getCustomerAgents()).data,
  });
};

export const useCreateCustomer = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CustomerCreateRequest) => (await createCustomer(data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.all }),
  });
};

export const useUpdateCustomer = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CustomerSaveRequest }) =>
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

export const useUpdateCustomerContact = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      contactId,
      data,
    }: {
      customerId: number;
      contactId: number;
      data: CustomerContactUpdateRequest;
    }) => (await updateCustomerContact(customerId, contactId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};

export const useUpdateCustomerDestination = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerId,
      destinationId,
      data,
    }: {
      customerId: number;
      destinationId: number;
      data: CustomerDestinationUpdateRequest;
    }) => (await updateCustomerDestination(customerId, destinationId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};

export const useCustomerContactFigures = () => {
  return useQuery({
    queryKey: CustomersQueryKeys.contactFigures,
    queryFn: async () => (await getCustomerContactFigures()).data,
  });
};

export const useCreateCustomerContact = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, data }: { customerId: number; data: CustomerContactCreateRequest }) =>
      (await createCustomerContact(customerId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};

export const useDeleteCustomerContact = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, contactId }: { customerId: number; contactId: number }) => {
      await deleteCustomerContact(customerId, contactId);
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};

export const useCreateCustomerDestination = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, data }: { customerId: number; data: CustomerDestinationCreateRequest }) =>
      (await createCustomerDestination(customerId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};

export const useDeleteCustomerDestination = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, destinationId }: { customerId: number; destinationId: number }) => {
      await deleteCustomerDestination(customerId, destinationId);
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: CustomersQueryKeys.byId(variables.customerId) }),
  });
};
