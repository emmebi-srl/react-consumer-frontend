// ==============================
// Campaign List
// ==============================
export interface CampaignList {
  campaigns: Campaign[];
}

// ==============================
// Campaign  / Create / Update
// ==============================
export interface Campaign {
  id: number;
  campaignTypeId: number;
  name: string;
  description: string;
  mailSubject: string;
  mailTemplatePath: string;
  activationDate?: number | null;
  deactivationDate?: number | null;
  campaignType?: CampaignType;
  active: boolean;
}

export interface CampaignCreate {
  campaignTypeId: number;
  name: string;
  description: string;
  mailTemplate: string;
  mailSubject: string;
  activationDate?: string | null;
  deactivatioDate?: string | null;
  active: boolean;
}

export interface CampaignUpdate {
  campaignTypeId?: number | null;
  name?: string | null;
  description?: string | null;
  mailSubject?: string | null;
  mailTemplatePath?: string;
  activationDate?: string | null;
  deactivatioDate?: string | null;
  active?: boolean | null;
}

// ==============================
// Campaign Type List / s
// ==============================
export interface CampaignTypeList {
  campaignTypes: CampaignType[];
}

export interface CampaignType {
  id: number;
  name: string;
  applicationReference: string;
}

export interface CampaignTypeCreate {
  name: string;
  applicationReference: string;
}

export interface CampaignTypeUpdate {
  name?: string | null;
}

// ==============================
// Campaign Placeholder
// ==============================
export interface CampaignPlaceholderList {
  campaignPlaceholders: CampaignPlaceholder[];
}

export interface CampaignPlaceholder {
  id: number;
  campaignTypeId: number;
  name: string;
  description: string;
}

export interface CampaignPlaceholderCreate {
  campaignTypeId: number;
  name: string;
  description: string;
}

export interface CampaignPlaceholderUpdate {
  campaignTypeId?: number | null;
  name?: string | null;
  description?: string | null;
}

// ==============================
// Campaign Mail List
// ==============================
export interface CampaignMailList {
  campaignMails: CampaignMail[];
}

export interface CampaignMail {
  id: number;
  campaignId: number;
  customerId: number;
  systemId?: number | null;
  mailId?: number | null;
  email: string;
  sendDate: string;
  isProcessed: boolean;
  processingError: string;
  insertionDate: string;
}

export interface CampaignMailCreate {
  campaignId: number;
  customerId: number;
  systemId?: number | null;
  mailId?: number | null;
  email: string;
  sendDate?: string | null;
  isProcessed?: boolean | null;
  processingError?: string | null;
}

export interface CampaignMailUpdate {
  campaignId?: number | null;
  customerId?: number | null;
  systemId?: number | null;
  mailId?: number | null;
  email?: string | null;
  sendDate?: string | null;
  isProcessed?: boolean | null;
  processingError?: string | null;
}

// ==============================
// Campaign Mail Data List / s
// ==============================
export interface CampaignMailDataList {
  campaignMailData: CampaignMailData[];
}

export interface CampaignMailData {
  id: number;
  campaignMailId: number;
  campaignPlaceholderId: number;
  value: string;
}

export interface CampaignMailDataCreate {
  campaignMailId: number;
  campaignPlaceholderId: number;
  value: string;
}

export interface CampaignMailDataUpdate {
  campaignMailId?: number | null;
  campaignPlaceholderId?: number | null;
  value?: string | null;
}

export interface CampaignSearchRequest {
  search?: string;
  active?: boolean;
  fromDate?: number | null;
  toDate?: number | null;
  pageSize?: number;
  pageIndex?: number;
  includes?: string;
}

export interface CampaignPlaceholderSearchRequest {
  search?: string;
  campaignTypeId?: number;
  pageSize?: number;
  pageIndex?: number;
}
