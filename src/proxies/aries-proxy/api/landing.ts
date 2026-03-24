import ariesLandingServicesClient from '~/clients/aries-landing-services-client';
import {
  AcceptSubscriptionProposalRequest,
  RejectSubscriptionProposalRequest,
  SubscriptionProposal,
} from '~/types/aries-proxy/landing';

export const getSubscriptionProposal = (campaignAriesEmailId: number) => {
  return ariesLandingServicesClient.get<SubscriptionProposal>('landing/subscription-proposal', {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const acceptSubscriptionProposal = (campaignAriesEmailId: number, model: AcceptSubscriptionProposalRequest) => {
  return ariesLandingServicesClient.post('landing/accept-subscription-proposal', model, {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const rejectSubscriptionProposal = (campaignAriesEmailId: number, model: RejectSubscriptionProposalRequest) => {
  return ariesLandingServicesClient.post('landing/reject-subscription-proposal', model, {
    params: {
      campaignAriesEmailId,
    },
  });
};
