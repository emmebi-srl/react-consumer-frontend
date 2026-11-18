import { format } from 'date-fns';
import { CustomerDestination } from '~/types/aries-proxy/customers';
import { Ticket, TICKET_URGENCY_LABELS, TicketUrgency } from '~/types/aries-proxy/tickets';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';

/** "172/2026", plus the displayed number when it differs. */
export const formatTicketTitle = (ticket: Pick<Ticket, 'ticketId' | 'ticketYear' | 'ticketNumber'>) => {
  const base = `Ticket ${ticket.ticketId}/${ticket.ticketYear}`;
  const number = ticket.ticketNumber?.trim();
  return number && number !== String(ticket.ticketId) ? `${base} (n. ${number})` : base;
};

/** The database doesn't constrain the value: an unknown urgency shows its number. */
export const getUrgencyLabel = (urgency?: TicketUrgency | null) =>
  urgency == null ? '' : ((TICKET_URGENCY_LABELS as Partial<Record<number, string>>)[urgency] ?? String(urgency));

export const getUrgencyColor = (urgency?: TicketUrgency | null): 'default' | 'warning' | 'error' => {
  if (urgency === TicketUrgency.High) return 'error';
  if (urgency === TicketUrgency.Medium) return 'warning';
  return 'default';
};

/** Minutes as hours with two decimals, like the Delphi "ore da svolgere" (e.g. "7.743,33 h"). */
export const formatWorkHours = (minutes?: number | null) =>
  `${((minutes ?? 0) / 60).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;

export const formatDestination = (destination?: CustomerDestination | null) => {
  if (!destination) return '';
  const street = [destination.street, destination.houseNumber || null].filter(Boolean).join(', ');
  const town = [destination.postalCode, destination.municipality].filter(Boolean).join(' - ');
  return [street, destination.province ? `${town} (${destination.province})` : town].filter(Boolean).join(' · ');
};

/** API date (unix seconds) to the yyyy-MM-dd value of a date input. */
export const toDateInput = (unix?: number | null) =>
  unix ? format(getDateByUnixtimestamp({ unixTimestamp: unix }), 'yyyy-MM-dd') : '';

/** True when the expiration date is before today. */
export const isTicketExpired = (ticket: Pick<Ticket, 'expirationDate'>, isOpen: boolean) => {
  if (!ticket.expirationDate || !isOpen) return false;
  return toDateInput(ticket.expirationDate) < format(new Date(), 'yyyy-MM-dd');
};
