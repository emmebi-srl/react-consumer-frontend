import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  createSystemSubscription,
  getSystemSubscriptionProposalAcceptances,
  getSystemSubscriptions,
} from './api/system-subscriptions';
import { CampaignQueryKeys } from './campaigns';
import { SystemsQueryKeys } from './systems';
import { CreateSystemSubscriptionRequest } from '~/types/aries-proxy/system-subscriptions';

export const SystemSubscriptionQueryKeys = {
  all: ['SystemSubscriptions'] as const,
  bySystemId: (systemId: number, includes?: string) =>
    ['SystemSubscriptions', 'system', systemId, includes ?? ''] as const,
  proposalAcceptances: (systemId: number, campaignMailId?: number, includes?: string) =>
    ['SystemSubscriptions', 'proposalAcceptance', systemId, campaignMailId ?? 0, includes ?? ''] as const,
};

export const useSystemSubscriptionsBySystemId = (
  systemId: number,
  options?: { includes?: string; enabled?: boolean },
) => {
  return useQuery({
    queryKey: SystemSubscriptionQueryKeys.bySystemId(systemId, options?.includes),
    queryFn: async () => (await getSystemSubscriptions({ systemId, includes: options?.includes })).data,
    enabled: (options?.enabled ?? true) && !!systemId,
  });
};

export const useSystemSubscriptionProposalAcceptances = (
  systemId: number,
  options?: { campaignMailId?: number; includes?: string; enabled?: boolean; pageSize?: number; pageIndex?: number },
) => {
  return useQuery({
    queryKey: SystemSubscriptionQueryKeys.proposalAcceptances(systemId, options?.campaignMailId, options?.includes),
    queryFn: async () =>
      (
        await getSystemSubscriptionProposalAcceptances({
          systemId,
          campaignMailId: options?.campaignMailId,
          includes: options?.includes,
          pageSize: options?.pageSize,
          pageIndex: options?.pageIndex,
        })
      ).data,
    enabled: (options?.enabled ?? true) && !!systemId,
  });
};

export const useCreateSystemSubscription = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSystemSubscriptionRequest) => (await createSystemSubscription(data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: SystemSubscriptionQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ['systems'],
        }),
        queryClient.invalidateQueries({
          queryKey: CampaignQueryKeys.allMails,
        }),
        queryClient.invalidateQueries({
          queryKey: SystemsQueryKeys.byIds([variables.systemId]),
        }),
      ]);
    },
  });
};
