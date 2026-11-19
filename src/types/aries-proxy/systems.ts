import { Customer, CustomerDestination } from './customers';

/** A periodic check of the year (impianto_abbonamenti_mesi), "Scadenze" page. */
export interface SystemPeriodicCheck {
  id: number;
  systemId: number;
  systemDescription?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  subscriptionName?: string | null;
  month: number;
  year: number;
  expectedDate?: number | null;
  executedDate?: number | null;
}

export interface SystemPeriodicCheckList {
  periodicChecks: SystemPeriodicCheck[];
}

export interface SystemPeriodicCheckRequest {
  year: number;
  onlyPending?: boolean;
  search?: string;
}

/** Installed components of a system with the same product and expiration ("Materiali in scadenza"). */
export interface SystemExpiringComponent {
  systemId: number;
  systemDescription?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  productCode: string;
  productDescription?: string | null;
  productBrand?: string | null;
  expirationDate?: number | null;
  installationDate?: number | null;
  quantity: number;
}

export interface SystemExpiringComponentList {
  components: SystemExpiringComponent[];
}

/** Dates yyyy-MM-dd; without fromDate the already expired components are included. */
export interface SystemExpiringComponentRequest {
  fromDate?: string;
  toDate: string;
  search?: string;
}

export interface SystemResponse {
  systems: System[];
}

export interface SystemSearchRequest {
  search?: string;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface SystemComponent {
  systemId: number;
  productCode: string;
  supplierProductCode?: string | null;
  productDescription?: string | null;
  productBrand?: string | null;
  position: number;
  expirationDate?: number | null;
  installationDate?: number | null;
  boxId?: number | null;
  disusedDate?: number | null;
  quantity: number;
}

export interface SystemSim {
  id: number;
  systemId: number;
  typeId: number;
  typeName: string;
  notes?: string | null;
  amount: number;
  monthDuration: number;
  phoneNumber?: string | null;
  accountHolder?: string | null;
  chargedTo?: string | null;
  activationDate?: number | null;
  renewDate?: number | null;
  expirationDate?: number | null;
  lastReminderDate?: number | null;
}

export interface System {
  id: number;
  customerId: number;
  companyName: string;
  subscriptionId?: number | null;
  operationDate: number;
  warrantlyDeadline: number;
  type: number;
  typeDescription: string;
  status: number;
  statusDescription: string;
  description: string;
  destinationId: number;
  central?: string | null;
  gsm?: string | null;
  dialer?: string | null;
  sked?: string | null;
  directoryPath: string;
  checklistId?: number | null;
  destination?: CustomerDestination;
  customer?: Customer;
  components?: SystemComponent[];
  sims?: SystemSim[];
}
