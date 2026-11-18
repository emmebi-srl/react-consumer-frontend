import { format } from 'date-fns';
import { Ticket, TicketSaveRequest, TicketUrgency } from '~/types/aries-proxy/tickets';
import { toDateInput } from '../ticketHelpers';

export interface TicketCustomerOption {
  id: number;
  name: string;
}

/** Selects hold '' when nothing is chosen, dates are yyyy-MM-dd ('' = none). */
export interface TicketFormValues {
  customer: TicketCustomerOption | null;
  systemId: number | '';
  ticketNumber: string;
  ticketDate: string;
  description: string;
  causalId: number | '';
  interventionTypeId: number | '';
  requestChannelId: number | '';
  urgency: TicketUrgency;
  expirationDate: string;
  solutionDate: string;
  reminderDate: string;
  /** Minutes, as typed. */
  workMinutes: string;
}

/** A new ticket, like Delphi EnableEditMode('inserisci'): today, low urgency, no time, lookups to choose. */
export const newTicketValues = (today: Date = new Date()): TicketFormValues => ({
  customer: null,
  systemId: '',
  ticketNumber: '',
  ticketDate: format(today, 'yyyy-MM-dd'),
  description: '',
  causalId: '',
  interventionTypeId: '',
  requestChannelId: '',
  urgency: TicketUrgency.Low,
  expirationDate: '',
  solutionDate: '',
  reminderDate: '',
  workMinutes: '0',
});

export const fromTicket = (ticket: Ticket): TicketFormValues => ({
  customer: { id: ticket.customerId, name: ticket.customerName ?? `Cliente ${ticket.customerId}` },
  systemId: ticket.systemId ?? '',
  ticketNumber: ticket.ticketNumber ?? '',
  ticketDate: toDateInput(ticket.ticketDate ?? ticket.createdDatetime),
  description: ticket.description ?? '',
  causalId: ticket.causalId || '',
  interventionTypeId: ticket.interventionTypeId || '',
  requestChannelId: ticket.communicatedVia || '',
  urgency: ticket.urgency,
  expirationDate: toDateInput(ticket.expirationDate),
  solutionDate: toDateInput(ticket.solutionDate),
  reminderDate: toDateInput(ticket.rememberMeDate),
  workMinutes: String(ticket.workMinutes ?? 0),
});

/** The first missing required field, with the message of the Delphi form; null when the form can be saved. */
export const getMissingField = (values: TicketFormValues): string | null => {
  if (!values.customer) return 'Indicare un cliente.';
  if (values.interventionTypeId === '') return 'Selezionare il tipo di intervento.';
  if (values.causalId === '') return 'Selezionare una causale.';
  if (values.requestChannelId === '') return 'Selezionare come è pervenuta la richiesta.';
  return null;
};

const parseMinutes = (value: string) => {
  const minutes = Number(value.trim().replace(',', '.'));
  return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 0;
};

/** Call only after getMissingField returned null. */
export const toSaveRequest = (values: TicketFormValues): TicketSaveRequest => ({
  customerId: values.customer?.id ?? 0,
  systemId: values.systemId === '' ? null : values.systemId,
  ticketNumber: values.ticketNumber.trim() || null,
  ticketDate: values.ticketDate || null,
  description: values.description,
  causalId: Number(values.causalId),
  interventionTypeId: Number(values.interventionTypeId),
  requestChannelId: Number(values.requestChannelId),
  urgency: values.urgency,
  expirationDate: values.expirationDate || null,
  solutionDate: values.solutionDate || null,
  reminderDate: values.reminderDate || null,
  workMinutes: parseMinutes(values.workMinutes),
});
