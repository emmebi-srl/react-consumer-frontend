export interface Subscription {
  id: number;
  year: number;
  name: string;
  description: string;
  isDefault: boolean;
  duration: number;
  subscriptionAmount: number;
  callRightAmount: number;
  extraordinaryCallRightAmount: number;
  callAvailability: number;
  includedHours: number;
  includedExtraordinaryHours: number;
  includedRemoteSupport: number;
}

export interface SubscriptionList {
  subscriptions: Subscription[];
}
