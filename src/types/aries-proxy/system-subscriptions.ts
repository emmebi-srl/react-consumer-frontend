export interface SystemSubscriptionMonth {
  id: number;
  systemId: number;
  subscriptionId: number;
  year: number;
  month: number;
  executedAt?: string | null;
  reportId?: number | null;
  reportYear?: number | null;
  scheduledAt?: string | null;
  price?: number | null;
  note?: string | null;
}

export interface SystemExit {
  systemId: number;
  subscriptionId: number;
  year: number;
  firstHourAmount: number;
  callRightAmount: number;
  extraordinaryCallRightAmount: number;
  callAvailability: number;
  includedHours: number;
  includedExtraordinaryHours: number;
  includedRemoteSupport: number;
  subscriptionAmount: number;
  maintenanceAmount: number;
}

export interface SystemSubscription {
  systemId: number;
  subscriptionId: number;
  year: number;
  months?: SystemSubscriptionMonth[] | null;
  exit?: SystemExit | null;
}

export interface SystemSubscriptionList {
  systemSubscriptions: SystemSubscription[];
}

export interface SystemSubscriptionProposalAcceptanceMonth {
  id: number;
  systemSubscriptionProposalAcceptanceId: number;
  monthIndex: number;
  insertionDate: number;
}

export interface SystemSubscriptionProposalAcceptance {
  id: number;
  campaignMailId?: number | null;
  systemId: number;
  maintenanceCount: number;
  singleMaintenancePrice: number;
  callRightPrice: number;
  termsAndConditionsAcceptanceDate: number;
  subscriptionTermsAcceptanceDate: number;
  immediateCallRightInvoicingAcceptanceDate: number;
  insertionDate: number;
  months?: SystemSubscriptionProposalAcceptanceMonth[] | null;
}

export interface SystemSubscriptionProposalAcceptanceList {
  systemSubscriptionProposalAcceptances: SystemSubscriptionProposalAcceptance[];
}

export interface SystemSubscriptionSearchRequest {
  systemId?: number;
  search?: string;
  includes?: string;
}

export interface SystemSubscriptionProposalAcceptanceSearchRequest {
  campaignMailId?: number;
  systemId?: number;
  includes?: string;
  pageSize?: number;
  pageIndex?: number;
}

export interface CreateSystemSubscriptionRequest {
  systemId: number;
  subscriptionId: number;
  year: number;
  subscriptionAmount: number;
  maintenanceAmount: number;
  firstHourAmount: number;
  callRightAmount: number;
  months: number[];
  createForEntireDuration: boolean;
  createCallRightPreinvoice: boolean;
}

export interface SystemSubscriptionOperationResult {
  systemSubscriptions: SystemSubscription[];
  preinvoice?: {
    invoiceYear: number;
    invoiceId: number;
  } | null;
}
