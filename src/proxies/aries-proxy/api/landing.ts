import ariesLandingServicesClient from '~/clients/aries-landing-services-client';
import {
  AcceptSubscriptionProposalRequest,
  CampaignUnsubscribeInfo,
  RejectSubscriptionProposalRequest,
  RequestMoreInfoRequest,
  SubscriptionProposal,
} from '~/types/aries-proxy/landing';

export const getSubscriptionProposal = (campaignAriesEmailId: number) => {
  return ariesLandingServicesClient.get<SubscriptionProposal>('landing/subscription-proposal', {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const getCampaignUnsubscribeInfo = (campaignAriesEmailId: number) => {
  return ariesLandingServicesClient.get<CampaignUnsubscribeInfo>('landing/campaign-unsubscribe', {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const acceptSubscriptionProposal = (campaignAriesEmailId: number, model: AcceptSubscriptionProposalRequest) => {
  return ariesLandingServicesClient.post('landing/subscription-proposal/accept', model, {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const rejectSubscriptionProposal = (campaignAriesEmailId: number, model: RejectSubscriptionProposalRequest) => {
  return ariesLandingServicesClient.post('landing/subscription-proposal/reject', model, {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const unsubscribeCampaign = (campaignAriesEmailId: number) => {
  return ariesLandingServicesClient.post('landing/campaign-unsubscribe', null, {
    params: {
      campaignAriesEmailId,
    },
  });
};

export const requestMoreInfo = (campaignAriesEmailId: number, model: RequestMoreInfoRequest) => {
  return ariesLandingServicesClient.post('landing/subscription-proposal/request-more-info', model, {
    params: {
      campaignAriesEmailId,
    },
  });
};
