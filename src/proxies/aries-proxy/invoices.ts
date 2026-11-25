import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  InvoiceFlagsRequest,
  InvoiceSaveRequest,
  InvoiceSearchRequest,
  InvoiceSettings,
} from '~/types/aries-proxy/invoices';
import {
  cloneInvoice,
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoiceCustomerDefaults,
  getInvoiceEditorDefaults,
  getInvoiceAvailableDocuments,
  getInvoiceLookups,
  getInvoiceSettings,
  getInvoicePdf,
  getInvoicesMetadata,
  getInvoicesTotals,
  promoteInvoice,
  saveInvoice,
  saveInvoiceSettings,
  searchInvoiceBanks,
  searchInvoices,
  setInvoiceFlags,
} from './api/invoices';

const InvoiceSearchPageSize = 50;

export const InvoiceDetailIncludes =
  'customer,destination,status,type,causal,payment_condition,vat,vat_nature_type,bank,rows,amounts_by_tax,study,purchase_order,documents';

export const InvoiceQueryKeys = {
  all: ['Invoices'] as const,
  search: (params?: InvoiceSearchRequest) => ['Invoices', 'search', params ?? {}] as const,
  metadata: (params?: InvoiceSearchRequest) => ['Invoices', 'metadata', params ?? {}] as const,
  totals: (params?: InvoiceSearchRequest) => ['Invoices', 'totals', params ?? {}] as const,
  byId: (year: number, id: number) => ['Invoices', 'detail', year, id] as const,
  editorDefaults: ['Invoices', 'editor-defaults'] as const,
  lookups: ['InvoiceLookups'] as const,
  settings: ['InvoiceSettings'] as const,
  availableDocuments: (customerId: number) => ['InvoiceAvailableDocuments', customerId] as const,
  customerDefaults: (customerId: number, date: string) => ['InvoiceCustomerDefaults', customerId, date] as const,
  banks: (search: string, companyBanks: boolean) => ['InvoiceBanks', search, companyBanks] as const,
};

/** Archived PDF of the Delphi client (dashboard). */
export const useInvoicePdf = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ year, id }: { year: number; id: number }) => {
      const result = await getInvoicePdf(year, id);
      return result.data;
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
  });
};

export const useInvoicesSearch = (params?: InvoiceSearchRequest) => {
  const pageSize = params?.pageSize ?? InvoiceSearchPageSize;
  return useInfiniteQuery({
    queryKey: InvoiceQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const res = await searchInvoices({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.invoices.length < pageSize ? undefined : data.pageIndex + 1),
  });
};

export const useInvoicesMetadata = (params?: InvoiceSearchRequest) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.metadata(params),
    queryFn: async () => (await getInvoicesMetadata(params)).data,
  });
};

export const useInvoicesTotals = (params?: InvoiceSearchRequest, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.totals(params),
    queryFn: async () => (await getInvoicesTotals(params)).data,
    enabled: options?.enabled ?? true,
  });
};

/** Year 0 is a preinvoice. */
export const useInvoiceById = (year?: number, id?: number) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.byId(year ?? -1, id ?? 0),
    queryFn: async () =>
      (await getInvoiceById(year as number, id as number, InvoiceDetailIncludes)).data.invoices.at(0) ?? null,
    enabled: year !== undefined && !Number.isNaN(year) && !!id,
  });
};

export const useInvoiceLookups = () => {
  return useQuery({
    queryKey: InvoiceQueryKeys.lookups,
    queryFn: async () => (await getInvoiceLookups()).data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvoiceEditorDefaults = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.editorDefaults,
    queryFn: async () => (await getInvoiceEditorDefaults()).data,
    enabled: options?.enabled ?? true,
  });
};

export const useInvoiceCustomerDefaults = (customerId?: number | null, invoiceDate?: string) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.customerDefaults(customerId ?? 0, invoiceDate ?? ''),
    queryFn: async () => (await getInvoiceCustomerDefaults(customerId as number, invoiceDate)).data,
    enabled: !!customerId,
  });
};

export const useInvoiceBanks = (search: string, companyBanks: boolean) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.banks(search, companyBanks),
    queryFn: async () => (await searchInvoiceBanks(search, companyBanks)).data.banks,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InvoiceSaveRequest) => (await createInvoice(data)).data.invoices.at(0) ?? null,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: InvoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['InvoiceAvailableDocuments'] });
    },
  });
};

export const useSaveInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ year, id, data }: { year: number; id: number; data: InvoiceSaveRequest }) =>
      (await saveInvoice(year, id, data)).data.invoices.at(0) ?? null,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: InvoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['InvoiceAvailableDocuments'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ year, id }: { year: number; id: number }) => deleteInvoice(year, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: InvoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['InvoiceAvailableDocuments'] });
    },
  });
};

export const useCloneInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ year, id }: { year: number; id: number }) =>
      (await cloneInvoice(year, id)).data.invoices.at(0) ?? null,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: InvoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['InvoiceAvailableDocuments'] });
    },
  });
};

export const usePromoteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, invoiceDate }: { id: number; invoiceDate: string | null }) =>
      (await promoteInvoice(id, invoiceDate)).data.invoices.at(0) ?? null,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: InvoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['InvoiceAvailableDocuments'] });
    },
  });
};

export const useSetInvoiceFlags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ year, id, data }: { year: number; id: number; data: InvoiceFlagsRequest }) =>
      (await setInvoiceFlags(year, id, data)).data.invoices.at(0) ?? null,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: InvoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['InvoiceAvailableDocuments'] });
    },
  });
};

export const useInvoiceSettings = () => {
  return useQuery({
    queryKey: InvoiceQueryKeys.settings,
    queryFn: async () => (await getInvoiceSettings()).data,
  });
};

export const useSaveInvoiceSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InvoiceSettings) => (await saveInvoiceSettings(data)).data,
    onSuccess: (data) => queryClient.setQueryData(InvoiceQueryKeys.settings, data),
  });
};

/** Documents still to invoice for the customer (the import dialog of the editor). */
export const useInvoiceAvailableDocuments = (customerId?: number | null, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: InvoiceQueryKeys.availableDocuments(customerId ?? 0),
    queryFn: async () => (await getInvoiceAvailableDocuments(customerId)).data.documents,
    enabled: (options?.enabled ?? true) && !!customerId,
    // A DDT made in another tab from a report must show up when the dialog opens again.
    refetchOnMount: 'always',
  });
};
