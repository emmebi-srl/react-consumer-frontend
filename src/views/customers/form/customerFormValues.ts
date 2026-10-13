import { Customer, CustomerContact, CustomerDestination } from '~/types/aries-proxy/customers';

export interface CustomerFormValues {
  companyName: string;
  companyName2: string;
  vat: string;
  taxCode: string;
  attentionTo: string;
  status: string;
  customerTypeId: number | '';
  website: string;
  isInsolvent: boolean;
  uniqueCode: string;
  recipientCode: string;
  contactTitle: string;
  contactName: string;
  contactPhone: string;
  contactMobilePhone: string;
  contactEmail: string;
  destinationComuneId: number | '';
  destinationFrazioneId: number | '';
  destinationStreet: string;
  destinationHouseNumber: number | '';
  destinationOther: string;
  destinationProvince: string;
  destinationKm: number | '';
  destinationMinutes: number | '';
}

export const getCustomerFormValues = (
  customer?: Customer,
  mainContact?: CustomerContact,
  mainDestination?: CustomerDestination,
): CustomerFormValues => ({
  companyName: customer?.companyName ?? '',
  companyName2: customer?.companyName2 ?? '',
  vat: customer?.vat ?? '',
  taxCode: customer?.taxCode ?? '',
  attentionTo: customer?.attentionTo ?? '',
  status: customer?.status ?? '',
  customerTypeId: customer?.customerTypeId ?? '',
  website: customer?.website ?? '',
  isInsolvent: customer?.isInsolvent ?? false,
  uniqueCode: customer?.uniqueCode ?? '',
  recipientCode: customer?.recipientCode ?? '',
  contactTitle: mainContact?.title ?? '',
  contactName: mainContact?.name ?? '',
  contactPhone: mainContact?.phone ?? '',
  contactMobilePhone: mainContact?.mobilePhone ?? '',
  contactEmail: mainContact?.email ?? '',
  destinationComuneId: '',
  destinationFrazioneId: '',
  destinationStreet: mainDestination?.street ?? '',
  destinationHouseNumber: mainDestination?.houseNumber ?? '',
  destinationOther: mainDestination?.other ?? '',
  destinationProvince: mainDestination?.province ?? '',
  destinationKm: mainDestination?.km ?? '',
  destinationMinutes: mainDestination?.minutes ?? '',
});

export const toOptionalNumber = (value: number | '') => (value === '' ? undefined : value);
