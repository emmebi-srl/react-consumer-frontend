export interface CompanyInfo {
  businessName: string;
  address?: string | null;
  number?: string | null;
  postalCode?: string | null;
  municipality?: string | null;
  province?: string | null;
  phoneNumber?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  vatNumber?: string | null;
  fiscalCode?: string | null;
  reaNumber?: string | null;
  shareCapital?: string | null;
  bankName?: string | null;
  iban?: string | null;
}

export interface SubscriptionProposal {
  companyName: string;
  systemType: string;
  systemDescription: string;
  systemAddress: string;
  maintenanceCount: number;
  singleMaintenancePrice: number;
  callRightPrice: number;
  subscriberInterventionPrice: number;
  nonSubscriberInterventionPrice: number;
  isInFinalState: boolean;
  companyInfo?: CompanyInfo | null;
}

export interface CampaignUnsubscribeInfo {
  email: string;
  campaignTypeName: string;
  unsubscribeWarning?: string | null;
  companyName?: string | null;
  systemType?: string | null;
  systemDescription?: string | null;
  isAlreadyUnsubscribed: boolean;
  companyInfo?: CompanyInfo | null;
}

export interface AcceptSubscriptionProposalRequest {
  selectedMonthIndexes: number[];
  termsAndConditionsAcceptanceDate: number;
  subscriptionTermsAcceptanceDate: number;
  immediateCallRightInvoicingAcceptanceDate: number;
  note?: string | null;
}

export interface RejectSubscriptionProposalRequest {
  note: string;
}

export interface RequestMoreInfoRequest {
  note?: string | null;
}
