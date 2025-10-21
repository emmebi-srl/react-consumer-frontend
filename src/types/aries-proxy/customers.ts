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

export interface Customer {
  id: number;
  companyName: string;
  taxCode: string;
  vat: string;
  status?: string | null;
  isInsolvent: boolean;
  customerTypeId?: number | null;
  customerStatusId?: number | null;
  createdAt?: number | null;
}
