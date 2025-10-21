import { CustomerDestination } from './customers';

export enum WorkTypeEnum {
  Maintenance = 2,
  Ticket = 1,
}

export interface WorksResponse {
  list: Work[];
}

export interface Work {
  systemId: number;
  customerId: number;
  systemDescription: string;
  systemType: string;
  systemStatus: string;
  companyName: string;
  distance: number;
  longitude: number;
  latitude: number;
  destination: CustomerDestination;
  items: WorkType[];
}

export interface WorkType {
  workType: WorkTypeEnum;
  title: string;
  description: string;
  urgency: number;
  expirationDate?: number;
  referenceId: number;
}
