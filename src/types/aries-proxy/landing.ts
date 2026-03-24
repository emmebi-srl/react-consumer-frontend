export interface SubscriptionProposal {
  companyName: string;
  systemType: string;
  systemDescription: string;
  systemAddress: string;
  maintenanceCount: number;
  singleMaintenancePrice: number;
  callRightPrice: number;
}

export interface AcceptSubscriptionProposalRequest {
  selectedMonthIndexes: number[];
  termsAndConditionsAcceptanceDate: string;
  immediateCallRightInvoicingAcceptanceDate: string;
  note?: string | null;
}

export interface RejectSubscriptionProposalRequest {
  note: string;
}
