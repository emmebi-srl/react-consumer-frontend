import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';

import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  getCampaignTypes,
  getCampaignTypeById,
  createCampaignType,
  updateCampaignType,
  getCampaignPlaceholders,
  getCampaignPlaceholderById,
  createCampaignPlaceholder,
  updateCampaignPlaceholder,
  getCampaignMails,
  getCampaignMailById,
  createCampaignMail,
  updateCampaignMail,
  getCampaignMailData,
  getCampaignMailDataById,
  createCampaignMailData,
  updateCampaignMailData,
  searchCampaignPlaceholders,
  getCampaignsMetadata,
} from './api/campaigns';
import {
  CampaignCreate,
  CampaignMailCreate,
  CampaignMailDataCreate,
  CampaignMailDataUpdate,
  CampaignMailUpdate,
  CampaignPlaceholderCreate,
  CampaignPlaceholderSearchRequest,
  CampaignPlaceholderUpdate,
  CampaignSearchRequest,
  CampaignTypeCreate,
  CampaignTypeUpdate,
  CampaignUpdate,
} from '~/types/aries-proxy/campaigns';

const CampaignSearchPageSize = 100;

//
// ------------------------------------------------------------
// QUERY KEYS
// ------------------------------------------------------------
//

export const CampaignQueryKeys = {
  all: ['Campaigns'] as const,
  search: (params: CampaignSearchRequest) => ['Campaigns', 'search', params] as const,
  metadata: (params: CampaignSearchRequest) => ['Campaign', 'metadata', params] as const,
  byId: (id: number) => ['Campaign', id] as const,

  allTypes: ['CampaignTypes'] as const,
  types: ['CampaignTypes'] as const,
  typeById: (id: number) => ['CampaignType', id] as const,

  allPlaceholders: ['CampaignPlaceholders'] as const,
  placeholdersSearch: (params: CampaignPlaceholderSearchRequest) => ['CampaignPlaceholders', 'search', params] as const,
  placeholders: ['CampaignPlaceholders'] as const,
  placeholderById: (id: number) => ['CampaignPlaceholder', id] as const,

  allMails: ['CampaignMails'] as const,
  mails: (campaignId: number) => ['CampaignMails', campaignId] as const,
  mailById: (id: number) => ['CampaignMail', id] as const,

  allMailData: ['CampaignMailData'] as const,
  mailData: (mailId: number) => ['CampaignMailData', mailId] as const,
  mailDataById: (id: number) => ['CampaignMailDataItem', id] as const,
};

// ------------------------------------------------------------
// CAMPAIGNS
// ------------------------------------------------------------
//

export const useCampaignsSearch = (params: CampaignSearchRequest) => {
  return useInfiniteQuery({
    queryKey: CampaignQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = CampaignSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : 1;
      const res = await getCampaigns({
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
      if (data.campaigns.length < CampaignSearchPageSize) {
        return undefined;
      }

      const args = data.pageParam;
      return (Number(args.pageIndex) + 1).toString();
    },
  });
};

export const useCampaignsMetadata = (params: CampaignSearchRequest) => {
  return useQuery({
    queryKey: CampaignQueryKeys.metadata(params),
    queryFn: async () => {
      const res = await getCampaignsMetadata({
        ...params,
      });
      return res.data;
    },
  });
};

export const useCampaignById = (id: number, options?: { includes?: string }) => {
  return useQuery({
    queryKey: CampaignQueryKeys.byId(id),
    queryFn: async () => {
      const res = await getCampaignById(id, options);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CampaignCreate) => {
      const res = await createCampaign(payload);
      return res.data;
    },
    onError: (err, data) =>
      exceptionLogger.captureException(err, {
        extra: {
          data,
        },
      }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.all,
        }),
      ]);
    },
  });
};

export const useUpdateCampaign = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CampaignUpdate }) => {
      const res = await updateCampaign(id, data);
      return res.data;
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.all,
        }),
      ]);
    },
  });
};

//
// ------------------------------------------------------------
// CAMPAIGN TYPES
// ------------------------------------------------------------
//

export const useCampaignTypes = () => {
  return useQuery({
    queryKey: CampaignQueryKeys.types,
    queryFn: async () => (await getCampaignTypes()).data,
  });
};

export const useCampaignTypeById = (id: number) => {
  return useQuery({
    queryKey: CampaignQueryKeys.typeById(id),
    queryFn: async () => (await getCampaignTypeById(id)).data,
    enabled: !!id,
  });
};

export const useCreateCampaignType = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CampaignTypeCreate) => (await createCampaignType(data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allTypes,
        }),
      ]);
    },
  });
};

export const useUpdateCampaignType = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CampaignTypeUpdate }) =>
      (await updateCampaignType(id, data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allTypes,
        }),
      ]);
    },
  });
};

//
// ------------------------------------------------------------
// CAMPAIGN PLACEHOLDERS
// ------------------------------------------------------------
//

export const useCampaignPlaceholders = () => {
  return useQuery({
    queryKey: CampaignQueryKeys.placeholders,
    queryFn: async () => (await getCampaignPlaceholders()).data,
  });
};

export const useCampaignPlaceholdersSearch = (
  params: CampaignPlaceholderSearchRequest,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery({
    queryKey: CampaignQueryKeys.placeholdersSearch(params),
    queryFn: async () => (await searchCampaignPlaceholders(params)).data,
    enabled: options?.enabled ?? true,
  });
};

export const useCampaignPlaceholderById = (id: number) => {
  return useQuery({
    queryKey: CampaignQueryKeys.placeholderById(id),
    queryFn: async () => (await getCampaignPlaceholderById(id)).data,
    enabled: !!id,
  });
};

export const useCreateCampaignPlaceholder = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CampaignPlaceholderCreate) => (await createCampaignPlaceholder(data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allPlaceholders,
        }),
      ]);
    },
  });
};

export const useUpdateCampaignPlaceholder = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CampaignPlaceholderUpdate }) =>
      (await updateCampaignPlaceholder(id, data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allPlaceholders,
        }),
      ]);
    },
  });
};

//
// ------------------------------------------------------------
// CAMPAIGN MAILS
// ------------------------------------------------------------
//

export const useCampaignMails = (campaignId: number) => {
  return useQuery({
    queryKey: CampaignQueryKeys.mails(campaignId),
    queryFn: async () => (await getCampaignMails(campaignId)).data,
    enabled: !!campaignId,
  });
};

export const useCampaignMailById = (id: number) => {
  return useQuery({
    queryKey: CampaignQueryKeys.mailById(id),
    queryFn: async () => (await getCampaignMailById(id)).data,
    enabled: !!id,
  });
};

export const useCreateCampaignMail = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CampaignMailCreate) => (await createCampaignMail(data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allMails,
        }),
      ]);
    },
  });
};

export const useUpdateCampaignMail = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CampaignMailUpdate }) =>
      (await updateCampaignMail(id, data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allMails,
        }),
      ]);
    },
  });
};

//
// ------------------------------------------------------------
// CAMPAIGN MAIL DATA
// ------------------------------------------------------------
//

export const useCampaignMailData = (campaignMailId: number) => {
  return useQuery({
    queryKey: CampaignQueryKeys.mailData(campaignMailId),
    queryFn: async () => (await getCampaignMailData(campaignMailId)).data,
    enabled: !!campaignMailId,
  });
};

export const useCampaignMailDataById = (id: number) => {
  return useQuery({
    queryKey: CampaignQueryKeys.mailDataById(id),
    queryFn: async () => (await getCampaignMailDataById(id)).data,
    enabled: !!id,
  });
};

export const useCreateCampaignMailData = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CampaignMailDataCreate) => (await createCampaignMailData(data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allMailData,
        }),
      ]);
    },
  });
};

export const useUpdateCampaignMailData = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CampaignMailDataUpdate }) =>
      (await updateCampaignMailData(id, data)).data,
    onError: (err, d) => exceptionLogger.captureException(err, { extra: { data: d } }),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allMailData,
        }),
      ]);
    },
  });
};
