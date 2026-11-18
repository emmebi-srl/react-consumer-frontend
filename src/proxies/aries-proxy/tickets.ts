import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  TicketEventCreateRequest,
  TicketSaveRequest,
  TicketSearchRequest,
  TicketStatusSaveRequest,
} from '~/types/aries-proxy/tickets';
import {
  cloneTicketQuote,
  generateTicketQuote,
  getTicketPeriodicChecks,
  saveTicketTags,
  scheduleTicketEvent,
  searchTicketTags,
  uploadTicketAttachment,
  createTicket,
  deleteTicket,
  getInterventionTypes,
  getTicketById,
  getTicketCausals,
  getTicketCustomerSystems,
  getTicketRequestChannels,
  getTicketsMetadata,
  getTicketStatuses,
  getTicketWorkload,
  saveTicket,
  searchTickets,
  setTicketPrinted,
  setTicketStatus,
} from './api/tickets';
import { getCustomerById } from './api/customers';

const TicketSearchPageSize = 50;

export const TicketQueryKeys = {
  all: ['Tickets'] as const,
  search: (params?: TicketSearchRequest) => ['Tickets', 'search', params ?? {}] as const,
  metadata: (params?: TicketSearchRequest) => ['Tickets', 'metadata', params ?? {}] as const,
  workload: ['Tickets', 'workload'] as const,
  byId: (id: number) => ['Tickets', 'detail', id] as const,
  statuses: ['TicketLookups', 'statuses'] as const,
  causals: ['TicketLookups', 'causals'] as const,
  interventionTypes: ['TicketLookups', 'intervention-types'] as const,
  requestChannels: ['TicketLookups', 'request-channels'] as const,
  customerSystems: (customerId: number) => ['TicketLookups', 'customer-systems', customerId] as const,
  customerContact: (customerId: number) => ['TicketLookups', 'customer-contact', customerId] as const,
  tags: (search: string) => ['TicketTags', search] as const,
  periodicChecks: (params: object) => ['Tickets', 'periodic-checks', params] as const,
};

export const TicketListIncludes = 'customer,system,status,causal,intervention_type';
export const TicketDetailIncludes =
  'customer,system,status,causal,intervention_type,request_channel,destination,documents,attachments,tags,events,system_conditions';

export const useTicketsSearch = (params?: TicketSearchRequest, options?: { enabled?: boolean }) => {
  const pageSize = params?.pageSize ?? TicketSearchPageSize;
  return useInfiniteQuery({
    queryKey: TicketQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const res = await searchTickets({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.list.length < pageSize ? undefined : data.pageIndex + 1),
    enabled: options?.enabled ?? true,
  });
};

export const useTicketsMetadata = (params?: TicketSearchRequest, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: TicketQueryKeys.metadata(params),
    queryFn: async () => (await getTicketsMetadata(params)).data,
    enabled: options?.enabled ?? true,
  });
};

export const useTicketWorkload = () => {
  return useQuery({
    queryKey: TicketQueryKeys.workload,
    queryFn: async () => (await getTicketWorkload()).data,
  });
};

export const useTicketById = (id?: number | null) => {
  return useQuery({
    queryKey: TicketQueryKeys.byId(id ?? 0),
    queryFn: async () => (await getTicketById(id as number, TicketDetailIncludes)).data.list.at(0) ?? null,
    enabled: !!id,
  });
};

export const useTicketStatuses = () => {
  return useQuery({
    queryKey: TicketQueryKeys.statuses,
    queryFn: async () => (await getTicketStatuses()).data.list,
    staleTime: 5 * 60 * 1000,
  });
};

/** Ids of the statuses with `aperto`, the rule the ticket triggers use; undefined until the statuses are loaded. */
export const useTicketOpenStatusIds = () => {
  const { data } = useTicketStatuses();
  return data ? data.filter((status) => status.isOpen).map((status) => status.id) : undefined;
};

export const useTicketCausals = () => {
  return useQuery({
    queryKey: TicketQueryKeys.causals,
    queryFn: async () => (await getTicketCausals()).data.causals,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInterventionTypes = () => {
  return useQuery({
    queryKey: TicketQueryKeys.interventionTypes,
    queryFn: async () => (await getInterventionTypes()).data.interventionTypes,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTicketRequestChannels = () => {
  return useQuery({
    queryKey: TicketQueryKeys.requestChannels,
    queryFn: async () => (await getTicketRequestChannels()).data.requestChannels,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTicketCustomerSystems = (customerId?: number | null) => {
  return useQuery({
    queryKey: TicketQueryKeys.customerSystems(customerId ?? 0),
    queryFn: async () => (await getTicketCustomerSystems(customerId as number)).data.systems,
    enabled: !!customerId,
  });
};

/** Main contact of the ticket customer (phone, mobile, email), like the "Cliente" box of the Delphi screen. */
export const useTicketCustomerMainContact = (customerId?: number | null) => {
  return useQuery({
    queryKey: TicketQueryKeys.customerContact(customerId ?? 0),
    queryFn: async () => {
      const customer = (await getCustomerById(customerId as number, { includes: 'contacts' })).data.customers.at(0);
      return customer?.contacts?.find((contact) => contact.isMain || contact.contactId === 1) ?? null;
    },
    enabled: !!customerId,
  });
};

/** A saved or deleted ticket refreshes list, counters, workload and detail. */
const useTicketMutation = <TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TicketQueryKeys.all }),
  });
};

export const useCreateTicket = () =>
  useTicketMutation(async (data: TicketSaveRequest) => (await createTicket(data)).data.list.at(0) ?? null);

export const useSaveTicket = () =>
  useTicketMutation(
    async ({ id, data }: { id: number; data: TicketSaveRequest }) =>
      (await saveTicket(id, data)).data.list.at(0) ?? null,
  );

export const useSetTicketStatus = () =>
  useTicketMutation(
    async ({ id, data }: { id: number; data: TicketStatusSaveRequest }) =>
      (await setTicketStatus(id, data)).data.list.at(0) ?? null,
  );

export const useSetTicketPrinted = () =>
  useTicketMutation(
    async ({ id, printed }: { id: number; printed: boolean }) =>
      (await setTicketPrinted(id, printed)).data.list.at(0) ?? null,
  );

export const useTicketTagsSearch = (search: string) => {
  return useQuery({
    queryKey: TicketQueryKeys.tags(search),
    queryFn: async () => (await searchTicketTags(search)).data.tags,
    staleTime: 60 * 1000,
  });
};

export const useTicketPeriodicChecks = (params: { year: number; onlyPending?: boolean; search?: string }) => {
  return useQuery({
    queryKey: TicketQueryKeys.periodicChecks(params),
    queryFn: async () => (await getTicketPeriodicChecks(params)).data.periodicChecks,
  });
};

/** New tag names may have been created: the tag suggestions are refreshed too. */
export const useSaveTicketTags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tags }: { id: number; tags: string[] }) =>
      (await saveTicketTags(id, tags)).data.list.at(0) ?? null,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TicketQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['TicketTags'] }),
      ]),
  });
};

export const useUploadTicketAttachment = () =>
  useTicketMutation(
    async ({ id, file }: { id: number; file: File }) =>
      (await uploadTicketAttachment(id, file)).data.list.at(0) ?? null,
  );

export const useScheduleTicketEvent = () =>
  useTicketMutation(
    async ({ id, data }: { id: number; data: TicketEventCreateRequest }) =>
      (await scheduleTicketEvent(id, data)).data.list.at(0) ?? null,
  );

export const useGenerateTicketQuote = () =>
  useTicketMutation(async (id: number) => (await generateTicketQuote(id)).data);

export const useCloneTicketQuote = () =>
  useTicketMutation(
    async ({ id, quoteId, quoteYear }: { id: number; quoteId: number; quoteYear: number }) =>
      (await cloneTicketQuote(id, quoteId, quoteYear)).data,
  );

export const useDeleteTicket = () =>
  useTicketMutation(async (id: number) => {
    await deleteTicket(id);
  });
