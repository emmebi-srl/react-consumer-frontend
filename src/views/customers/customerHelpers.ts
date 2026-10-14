import { Customer, CustomerContact, CustomerDestination } from '~/types/aries-proxy/customers';

export const getMainDestination = (customer: Pick<Customer, 'destinations'>): CustomerDestination | undefined => {
  const destinations = customer.destinations ?? [];
  return destinations.find((destination) => destination.mainDestination) ?? destinations[0];
};

export const getMainContact = (customer: Pick<Customer, 'contacts'>): CustomerContact | undefined => {
  const contacts = customer.contacts ?? [];
  return contacts.find((contact) => contact.isMain) ?? contacts[0];
};
