import { Customer, CustomerDestination } from './customers';

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
