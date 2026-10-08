import { ChipProps } from '@mui/material';
import { Customer, CustomerContact, CustomerDestination } from '~/types/aries-proxy/customers';

export const getMainDestination = (customer: Pick<Customer, 'destinations'>): CustomerDestination | undefined => {
  const destinations = customer.destinations ?? [];
  return destinations.find((destination) => destination.mainDestination) ?? destinations[0];
};

export const getMainContact = (customer: Pick<Customer, 'contacts'>): CustomerContact | undefined => {
  const contacts = customer.contacts ?? [];
  return contacts.find((contact) => contact.isMain) ?? contacts[0];
};

const STATUS_COLOR_BY_KEYWORD: { keyword: string; color: ChipProps['color'] }[] = [
  { keyword: 'ATTIV', color: 'success' },
  { keyword: 'SOSPES', color: 'warning' },
  { keyword: 'BLOCC', color: 'error' },
  { keyword: 'CESS', color: 'error' },
  { keyword: 'CHIUS', color: 'error' },
];

export const getStatusChipColor = (statusName?: string | null): ChipProps['color'] => {
  if (!statusName) return 'default';
  const normalized = statusName.toUpperCase();
  const match = STATUS_COLOR_BY_KEYWORD.find(({ keyword }) => normalized.includes(keyword));
  return match?.color ?? 'default';
};
