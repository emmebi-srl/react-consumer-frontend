export interface CustomerDestination {
  destinationId: number;
  customerId: number;
  province: string | null;
  municipality: string;
  fraction: string;
  street: string;
  houseNumber: number;
  other: string;
  km: number;
  minutes: number;
  longitude?: number | null;
  latitude?: number | null;
  postalCode?: string | null;
}

export interface CustomerContact {
  contactId: number;
  customerId: number;
  title?: string | null;
  name: string;
  figure?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  hasReminderCustomer: boolean;
}

export interface Customer {
  id: number;
  companyName: string;
  companyName2?: string | null;
  taxCode: string;
  vat: string;
  attentionTo?: string | null;
  status?: string | null;
  isInsolvent: boolean;
  customerTypeId?: number | null;
  economicStatusId?: number | null;
  paymentConditionId?: number | null;
  website?: string | null;
  relationshipTypeId?: number | null;
  agentId?: number | null;
  subscriptionId?: number | null;
  activityId?: number | null;
  uniqueCode?: string | null;
  recipientCode?: string | null;
  createdAt?: number | null;
  updatedAt?: number | null;
  contacts?: CustomerContact[];
  destinations?: CustomerDestination[];
}

export interface CustomerList {
  customers: Customer[];
}

export interface CustomerSearchRequest {
  search?: string;
  statusId?: string;
  customerTypeId?: number;
  pageIndex?: number;
  pageSize?: number;
  includes?: string;
}

export interface CustomerType {
  id: number;
  name: string;
  description?: string | null;
}

export interface CustomerTypeList {
  types: CustomerType[];
}

export interface CustomerStatusEntry {
  id: string;
  name: string;
  description?: string | null;
  locked: boolean;
}

export interface CustomerStatusList {
  statuses: CustomerStatusEntry[];
}
