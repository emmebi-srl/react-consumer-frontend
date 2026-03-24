import { useMutation, useQuery } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { acceptSubscriptionProposal, getSubscriptionProposal, rejectSubscriptionProposal } from './api/landing';
import { AcceptSubscriptionProposalRequest, RejectSubscriptionProposalRequest } from '~/types/aries-proxy/landing';

export const LandingQueryKeys = {
  all: ['Landing'] as const,
  subscriptionProposal: (campaignAriesEmailId: number) =>
    ['Landing', 'subscriptionProposal', campaignAriesEmailId] as const,
};

export const useSubscriptionProposal = (campaignAriesEmailId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: LandingQueryKeys.subscriptionProposal(campaignAriesEmailId),
    queryFn: async () => (await getSubscriptionProposal(campaignAriesEmailId)).data,
    enabled: options?.enabled ?? true,
  });
};

export const useAcceptSubscriptionProposal = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async (data: { campaignAriesEmailId: number; model: AcceptSubscriptionProposalRequest }) =>
      acceptSubscriptionProposal(data.campaignAriesEmailId, data.model),
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useRejectSubscriptionProposal = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async (data: { campaignAriesEmailId: number; model: RejectSubscriptionProposalRequest }) =>
      rejectSubscriptionProposal(data.campaignAriesEmailId, data.model),
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};
