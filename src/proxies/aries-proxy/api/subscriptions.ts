import ariesServicesClient from '~/clients/aries-services-client';
import { SubscriptionList } from '~/types/aries-proxy/subscriptions';

export const getSubscriptions = () => {
  return ariesServicesClient.get<SubscriptionList>('subscription/new');
};
