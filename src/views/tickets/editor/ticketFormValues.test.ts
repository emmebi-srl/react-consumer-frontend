import { describe, expect, it } from 'vitest';
import { Ticket, TicketUrgency } from '~/types/aries-proxy/tickets';
import { fromTicket, getMissingField, newTicketValues, toSaveRequest } from './ticketFormValues';

// 2025-11-17 00:00 UTC: the same calendar day in Italy.
const NOV_17 = 1763337600;

const baseTicket: Ticket = {
  id: 8213,
  ticketId: 172,
  ticketYear: 2026,
  ticketNumber: '172',
  systemId: 2258,
  customerId: 2258,
  urgency: TicketUrgency.Medium,
  description: 'Rapporto 806/2026: lavoro non terminato',
  expirationDate: null,
  interventionTypeId: 3,
  causalId: 1,
  createdDatetime: NOV_17,
  communicatedVia: 2,
  statusId: 1,
  printed: false,
  sent: false,
  ticketDate: NOV_17,
  solutionDate: null,
  rememberMeDate: NOV_17,
  workMinutes: 120,
  customerName: 'FORLIN VANNI',
};

describe('ticketFormValues', () => {
  it('starts a new ticket like Delphi: today, low urgency, no time, nothing chosen', () => {
    const values = newTicketValues(new Date(2026, 10, 18));
    expect(values.ticketDate).toBe('2026-11-18');
    expect(values.urgency).toBe(TicketUrgency.Low);
    expect(values.workMinutes).toBe('0');
    expect(values.customer).toBeNull();
    expect(getMissingField(values)).toBe('Indicare un cliente.');
  });

  it('asks for the lookups in the Delphi order', () => {
    const values = { ...newTicketValues(), customer: { id: 1, name: 'A' } };
    expect(getMissingField(values)).toBe('Selezionare il tipo di intervento.');
    expect(getMissingField({ ...values, interventionTypeId: 3 })).toBe('Selezionare una causale.');
    expect(getMissingField({ ...values, interventionTypeId: 3, causalId: 1 })).toBe(
      'Selezionare come è pervenuta la richiesta.',
    );
    expect(getMissingField({ ...values, interventionTypeId: 3, causalId: 1, requestChannelId: 2 })).toBeNull();
  });

  it('round-trips a saved ticket', () => {
    const values = fromTicket(baseTicket);
    expect(values.customer).toEqual({ id: 2258, name: 'FORLIN VANNI' });
    expect(values.ticketDate).toBe('2025-11-17');
    expect(values.reminderDate).toBe('2025-11-17');
    expect(values.expirationDate).toBe('');

    expect(toSaveRequest(values)).toEqual({
      customerId: 2258,
      systemId: 2258,
      ticketNumber: '172',
      ticketDate: '2025-11-17',
      description: 'Rapporto 806/2026: lavoro non terminato',
      causalId: 1,
      interventionTypeId: 3,
      requestChannelId: 2,
      urgency: TicketUrgency.Medium,
      expirationDate: null,
      solutionDate: null,
      reminderDate: '2025-11-17',
      workMinutes: 120,
    });
  });

  it('sends no system, an empty number as null and invalid minutes as 0', () => {
    const values = { ...fromTicket(baseTicket), systemId: '' as const, ticketNumber: '  ', workMinutes: 'abc' };
    const request = toSaveRequest(values);
    expect(request.systemId).toBeNull();
    expect(request.ticketNumber).toBeNull();
    expect(request.workMinutes).toBe(0);
    expect(toSaveRequest({ ...values, workMinutes: '90,4' }).workMinutes).toBe(90);
  });
});
