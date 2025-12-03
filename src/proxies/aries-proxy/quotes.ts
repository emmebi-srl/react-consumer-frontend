import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  createQuote,
  createQuoteItem,
  createQuoteLot,
  createQuoteRevision,
  getQuoteById,
  getQuoteItemById,
  getQuoteItems,
  getQuoteLotById,
  getQuoteLots,
  getQuoteRevisionById,
  getQuoteRevisions,
  getQuoteStatuses,
  getQuoteTypes,
  getQuotes,
  getQuotesMetadata,
  updateQuote,
  updateQuoteItem,
  updateQuoteLot,
  updateQuoteRevision,
} from './api/quotes';
import {
  QuoteCreate,
  QuoteItemCreate,
  QuoteItemUpdate,
  QuoteLotCreate,
  QuoteLotUpdate,
  QuoteRevisionCreate,
  QuoteRevisionUpdate,
  QuoteSearchRequest,
  QuoteUpdate,
} from '~/types/aries-proxy/quotes';

const QuoteSearchPageSize = 50;

export const QuoteQueryKeys = {
  all: ['Quotes'] as const,
  search: (params: QuoteSearchRequest) => ['Quotes', 'search', params] as const,
  metadata: (params: QuoteSearchRequest) => ['Quotes', 'metadata', params] as const,
  byId: (year: number, id: number) => ['Quote', year, id] as const,
  statuses: ['QuoteStatuses'] as const,
  types: ['QuoteTypes'] as const,
  revisions: (year: number, id: number) => ['Quote', year, id, 'revisions'] as const,
  revisionById: (year: number, id: number, revisionId: number) => ['Quote', year, id, 'revision', revisionId] as const,
  lots: (year: number, id: number, revisionId: number) => ['Quote', year, id, 'revision', revisionId, 'lots'] as const,
  lotById: (year: number, id: number, revisionId: number, position: number) =>
    ['Quote', year, id, 'revision', revisionId, 'lot', position] as const,
  items: (year: number, id: number, revisionId: number, position: number) =>
    ['Quote', year, id, 'revision', revisionId, 'lot', position, 'items'] as const,
  itemById: (year: number, id: number, revisionId: number, position: number, tabId: number) =>
    ['Quote', year, id, 'revision', revisionId, 'lot', position, 'item', tabId] as const,
};

export const useQuotesSearch = (params: QuoteSearchRequest) => {
  return useInfiniteQuery({
    queryKey: QuoteQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = params.pageSize ?? QuoteSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const res = await getQuotes({
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
      if (data.quotes.length < (params.pageSize ?? QuoteSearchPageSize)) {
        return undefined;
      }

      const args = data.pageParam;
      return (Number(args.pageIndex) + 1).toString();
    },
  });
};

export const useQuotesMetadata = (params: QuoteSearchRequest) => {
  return useQuery({
    queryKey: QuoteQueryKeys.metadata(params),
    queryFn: async () => (await getQuotesMetadata(params)).data,
  });
};

export const useQuoteById = (year: number, id: number, options?: { includes?: string }) => {
  return useQuery({
    queryKey: QuoteQueryKeys.byId(year, id),
    queryFn: async () => (await getQuoteById(year, id, options)).data,
    enabled: !!year && !!id,
  });
};

export const useQuoteStatuses = () => {
  return useQuery({
    queryKey: QuoteQueryKeys.statuses,
    queryFn: async () => (await getQuoteStatuses()).data,
  });
};

export const useQuoteTypes = () => {
  return useQuery({
    queryKey: QuoteQueryKeys.types,
    queryFn: async () => (await getQuoteTypes()).data,
  });
};

export const useCreateQuote = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: QuoteCreate) => (await createQuote(payload)).data,
    onError: (err, data) =>
      exceptionLogger.captureException(err, {
        extra: {
          data,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QuoteQueryKeys.all,
      }),
  });
};

export const useUpdateQuote = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ year, id, data }: { year: number; id: number; data: QuoteUpdate }) =>
      (await updateQuote(year, id, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.all }),
      ]),
  });
};

export const useQuoteRevisions = (year: number, id: number) => {
  return useQuery({
    queryKey: QuoteQueryKeys.revisions(year, id),
    queryFn: async () => (await getQuoteRevisions(year, id)).data,
    enabled: !!year && !!id,
  });
};

export const useQuoteRevisionById = (year: number, id: number, revisionId: number) => {
  return useQuery({
    queryKey: QuoteQueryKeys.revisionById(year, id, revisionId),
    queryFn: async () => (await getQuoteRevisionById(year, id, revisionId)).data,
    enabled: !!year && !!id && !!revisionId,
  });
};

export const useCreateQuoteRevision = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ year, id, data }: { year: number; id: number; data: QuoteRevisionCreate }) =>
      (await createQuoteRevision(year, id, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_res, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.revisions(variables.year, variables.id) }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
      ]),
  });
};

export const useUpdateQuoteRevision = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      year,
      id,
      revisionId,
      data,
    }: {
      year: number;
      id: number;
      revisionId: number;
      data: QuoteRevisionUpdate;
    }) => (await updateQuoteRevision(year, id, revisionId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_res, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.revisionById(variables.year, variables.id, variables.revisionId),
        }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.revisions(variables.year, variables.id) }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
      ]),
  });
};

export const useQuoteLots = (year: number, id: number, revisionId: number) => {
  return useQuery({
    queryKey: QuoteQueryKeys.lots(year, id, revisionId),
    queryFn: async () => (await getQuoteLots(year, id, revisionId)).data,
    enabled: !!year && !!id && !!revisionId,
  });
};

export const useQuoteLotById = (year: number, id: number, revisionId: number, position: number) => {
  return useQuery({
    queryKey: QuoteQueryKeys.lotById(year, id, revisionId, position),
    queryFn: async () => (await getQuoteLotById(year, id, revisionId, position)).data,
    enabled: !!year && !!id && !!revisionId && !!position,
  });
};

export const useCreateQuoteLot = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      year,
      id,
      revisionId,
      data,
    }: {
      year: number;
      id: number;
      revisionId: number;
      data: QuoteLotCreate;
    }) => (await createQuoteLot(year, id, revisionId, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_res, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.lots(variables.year, variables.id, variables.revisionId),
        }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
      ]),
  });
};

export const useUpdateQuoteLot = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      year,
      id,
      revisionId,
      position,
      data,
    }: {
      year: number;
      id: number;
      revisionId: number;
      position: number;
      data: QuoteLotUpdate;
    }) => (await updateQuoteLot(year, id, revisionId, position, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_res, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.lotById(variables.year, variables.id, variables.revisionId, variables.position),
        }),
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.lots(variables.year, variables.id, variables.revisionId),
        }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
      ]),
  });
};

export const useQuoteItems = (year: number, id: number, revisionId: number, position: number) => {
  return useQuery({
    queryKey: QuoteQueryKeys.items(year, id, revisionId, position),
    queryFn: async () => (await getQuoteItems(year, id, revisionId, position)).data,
    enabled: !!year && !!id && !!revisionId,
  });
};

export const useQuoteItemById = (year: number, id: number, revisionId: number, position: number, tabId: number) => {
  return useQuery({
    queryKey: QuoteQueryKeys.itemById(year, id, revisionId, position, tabId),
    queryFn: async () => (await getQuoteItemById(year, id, revisionId, position, tabId)).data,
    enabled: !!year && !!id && !!revisionId && !!position && !!tabId,
  });
};

export const useCreateQuoteItem = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      year,
      id,
      revisionId,
      position,
      data,
    }: {
      year: number;
      id: number;
      revisionId: number;
      position: number;
      data: QuoteItemCreate;
    }) => (await createQuoteItem(year, id, revisionId, position, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_res, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.items(variables.year, variables.id, variables.revisionId, variables.position),
        }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
      ]),
  });
};

export const useUpdateQuoteItem = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      year,
      id,
      revisionId,
      position,
      tabId,
      data,
    }: {
      year: number;
      id: number;
      revisionId: number;
      position: number;
      tabId: number;
      data: QuoteItemUpdate;
    }) => {
      const result = await updateQuoteItem(year, id, revisionId, position, tabId, data);
      return result.data;
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: (_res, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.itemById(
            variables.year,
            variables.id,
            variables.revisionId,
            variables.position,
            variables.tabId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: QuoteQueryKeys.items(variables.year, variables.id, variables.revisionId, variables.position),
        }),
        queryClient.invalidateQueries({ queryKey: QuoteQueryKeys.byId(variables.year, variables.id) }),
      ]),
  });
};
