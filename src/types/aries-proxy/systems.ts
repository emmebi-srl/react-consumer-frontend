import { CustomerDestination } from './customers';

export interface SystemResponse {
  systems: System[];
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
}
