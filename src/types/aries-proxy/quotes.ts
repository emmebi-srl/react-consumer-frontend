import { Customer, CustomerDestination } from './customers';

export interface QuoteList {
  quotes: Quote[];
}

export interface QuoteStatusList {
  statuses: QuoteStatus[];
}

export interface QuoteStatus {
  id: number;
  name: string;
  description?: string | null;
  color: string;
  priority: number;
  locked: boolean;
  resetReminder: boolean;
}

export interface QuoteTypeList {
  types: QuoteType[];
}

export interface QuoteType {
  id: number;
  name: string;
  description?: string | null;
  contractTypeId?: number | null;
}

export interface QuoteRevisionList {
  revisions: QuoteRevision[];
}

export interface QuoteLotList {
  lots: QuoteLot[];
}

export interface QuoteItemList {
  items: QuoteItem[];
}

export interface Quote {
  id: number;
  year: number;
  revisionId?: number | null;
  createdAt: string;
  status?: QuoteStatus;
  statusId?: number | null;
  note?: string | null;
  quoteTypeId: number;
  quoteType?: QuoteType;
  typeId?: number | null;
  agentId?: number | null;
  userId?: number | null;
  forEmployeeId?: number | null;
  fromEmployeeId?: number | null;
  reportedBy?: string | null;
  sentDate?: string | null;
  reminderCheck: boolean;
  firstReminderSentAt?: string | null;
  secondReminderSentAt?: string | null;
  revisions?: QuoteRevision[];
}

export interface QuoteRevision {
  id: number;
  quoteId: number;
  year: number;
  printed: boolean;
  sent: boolean;
  createdAt?: string | null;
  revisionDate?: string | null;
  priceListId?: number | null;
  discountPercent: number;
  hourPrice: number;
  hourCost: number;
  vatId: number;
  body?: string | null;
  courtesy?: string | null;
  subject?: string | null;
  note?: string | null;
  subscriptionId?: number | null;
  siteIn?: string | null;
  referenceId?: number | null;
  customerId?: number | null;
  destinationId?: number | null;
  markUpType?: number | null;
  markUpPercentage?: number | null;
  bodyRtf?: string | null;
  customer?: Customer;
  destination?: CustomerDestination;
  lots?: QuoteLot[];
}

export interface QuoteLot {
  position: number;
  quoteId: number;
  revisionId: number;
  year: number;
  lotId: number;
  note?: string | null;
  preface?: string | null;
  systemId?: number | null;
  subscriptionId?: number | null;
  discount?: number | null;
  plannedHours?: number | null;
  costHours?: number | null;
  optional: boolean;
  vatId?: number | null;
  chargeType?: number | null;
  chargePercentage?: number | null;
  items?: QuoteItem[];
}

export interface QuoteItem {
  tabId: number;
  quoteId: number;
  year: number;
  revisionId: number;
  lotPosition: number;
  articleId?: string | null;
  quantity?: number | null;
  supplierCode?: string | null;
  unitOfMeasure?: string | null;
  pictureFlag?: string | null;
  price?: number | null;
  cost?: number | null;
  installationTime?: number | null;
  hourPrice?: number | null;
  hourCost?: number | null;
  shortDescription?: string | null;
  priceListId?: number | null;
  locked: boolean;
  mounted: boolean;
  type?: string | null;
  discount?: number | null;
  vatId?: number | null;
  rowDiscount: number;
  laborDiscount: number;
  checked?: boolean | null;
  noteId?: number | null;
  insertedAt?: string | null;
  insertedByUser: number;
}

export interface QuoteSearchRequest {
  search?: string;
  year?: number;
  statusId?: number;
  typeId?: number;
  quoteTypeId?: number;
  fromDate?: string;
  toDate?: string;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface QuoteCreate {
  id?: number;
  year: number;
  revisionId?: number | null;
  createdAt?: string;
  statusId?: number | null;
  note?: string | null;
  quoteTypeId: number;
  typeId?: number | null;
  agentId?: number | null;
  userId?: number | null;
  forEmployeeId?: number | null;
  fromEmployeeId?: number | null;
  reportedBy?: string | null;
  sentDate?: string | null;
  reminderCheck?: boolean;
  firstReminderSentAt?: string | null;
  secondReminderSentAt?: string | null;
}

export interface QuoteUpdate {
  revisionId?: number | null;
  createdAt?: string;
  statusId?: number | null;
  note?: string | null;
  quoteTypeId?: number | null;
  typeId?: number | null;
  agentId?: number | null;
  userId?: number | null;
  forEmployeeId?: number | null;
  fromEmployeeId?: number | null;
  reportedBy?: string | null;
  sentDate?: string | null;
  reminderCheck?: boolean | null;
  firstReminderSentAt?: string | null;
  secondReminderSentAt?: string | null;
}

export interface QuoteRevisionCreate {
  id?: number;
  printed?: boolean;
  sent?: boolean;
  createdAt?: string | null;
  revisionDate?: string | null;
  priceListId?: number | null;
  discountPercent: number;
  hourPrice: number;
  hourCost: number;
  vatId: number;
  body?: string | null;
  courtesy?: string | null;
  subject?: string | null;
  note?: string | null;
  subscriptionId?: number | null;
  siteIn?: string | null;
  referenceId?: number | null;
  customerId?: number | null;
  destinationId?: number | null;
  markUpType?: number | null;
  markUpPercentage?: number | null;
  bodyRtf?: string | null;
}

export interface QuoteRevisionUpdate {
  printed?: boolean;
  sent?: boolean;
  createdAt?: string | null;
  revisionDate?: string | null;
  priceListId?: number | null;
  discountPercent?: number;
  hourPrice?: number;
  hourCost?: number;
  vatId?: number;
  body?: string | null;
  courtesy?: string | null;
  subject?: string | null;
  note?: string | null;
  subscriptionId?: number | null;
  siteIn?: string | null;
  referenceId?: number | null;
  customerId?: number | null;
  destinationId?: number | null;
  markUpType?: number | null;
  markUpPercentage?: number | null;
  bodyRtf?: string | null;
}

export interface QuoteLotCreate {
  position?: number;
  lotId: number;
  note?: string | null;
  preface?: string | null;
  systemId?: number | null;
  subscriptionId?: number | null;
  discount?: number | null;
  plannedHours?: number | null;
  costHours?: number | null;
  optional?: boolean;
  vatId?: number | null;
  chargeType?: number | null;
  chargePercentage?: number | null;
}

export interface QuoteLotUpdate {
  lotId?: number;
  note?: string | null;
  preface?: string | null;
  systemId?: number | null;
  subscriptionId?: number | null;
  discount?: number | null;
  plannedHours?: number | null;
  costHours?: number | null;
  optional?: boolean;
  vatId?: number | null;
  chargeType?: number | null;
  chargePercentage?: number | null;
}

export interface QuoteItemCreate {
  tabId?: number;
  articleId?: string | null;
  quantity?: number | null;
  supplierCode?: string | null;
  unitOfMeasure?: string | null;
  pictureFlag?: string | null;
  price?: number | null;
  cost?: number | null;
  installationTime?: number | null;
  hourPrice?: number | null;
  hourCost?: number | null;
  shortDescription?: string | null;
  priceListId?: number | null;
  locked?: boolean;
  mounted?: boolean;
  type?: string | null;
  discount?: number | null;
  vatId?: number | null;
  rowDiscount?: number | null;
  laborDiscount?: number | null;
  checked?: boolean | null;
  noteId?: number | null;
  insertedAt?: string | null;
  insertedByUser?: number | null;
}

export interface QuoteItemUpdate {
  articleId?: string | null;
  quantity?: number | null;
  supplierCode?: string | null;
  unitOfMeasure?: string | null;
  pictureFlag?: string | null;
  price?: number | null;
  cost?: number | null;
  installationTime?: number | null;
  hourPrice?: number | null;
  hourCost?: number | null;
  shortDescription?: string | null;
  priceListId?: number | null;
  locked?: boolean;
  mounted?: boolean;
  type?: string | null;
  discount?: number | null;
  vatId?: number | null;
  rowDiscount?: number | null;
  laborDiscount?: number | null;
  checked?: boolean | null;
  noteId?: number | null;
  insertedAt?: string | null;
  insertedByUser?: number | null;
}
