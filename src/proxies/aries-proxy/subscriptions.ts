import { useQuery } from '@tanstack/react-query';
import { getSubscriptions } from './api/subscriptions';

export const SubscriptionQueryKeys = {
  all: ['Subscriptions'] as const,
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: SubscriptionQueryKeys.all,
    queryFn: async () => (await getSubscriptions()).data.subscriptions,
  });
};
