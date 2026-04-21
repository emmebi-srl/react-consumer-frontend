import ariesServicesClient from '~/clients/aries-services-client';
import {
  CreateSystemSubscriptionRequest,
  SystemSubscriptionProposalAcceptanceList,
  SystemSubscriptionProposalAcceptanceSearchRequest,
  SystemSubscriptionSearchRequest,
  SystemSubscriptionList,
  SystemSubscriptionOperationResult,
} from '~/types/aries-proxy/system-subscriptions';

export const getSystemSubscriptions = (options?: SystemSubscriptionSearchRequest) => {
  return ariesServicesClient.get<SystemSubscriptionList>('system-subscription', {
    params: options,
  });
};

export const getSystemSubscriptionProposalAcceptances = (
  options?: SystemSubscriptionProposalAcceptanceSearchRequest,
) => {
  return ariesServicesClient.get<SystemSubscriptionProposalAcceptanceList>('system-subscription/proposal-acceptance', {
    params: options,
  });
};

export const createSystemSubscription = (model: CreateSystemSubscriptionRequest) => {
  return ariesServicesClient.post<SystemSubscriptionOperationResult>('system-subscription', model);
};
