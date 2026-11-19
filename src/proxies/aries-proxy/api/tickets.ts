import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  InterventionTypeList,
  TicketCausalList,
  TicketList,
  TicketRequestChannelList,
  TicketSaveRequest,
  TicketSearchRequest,
  TicketStatusList,
  TicketStatusSaveRequest,
  TicketSystemList,
  TicketWorkload,
  TicketEventCreateRequest,
  TicketPrintScope,
  TicketQuoteLink,
  TicketTagList,
} from '~/types/aries-proxy/tickets';

/** Newest first: by year, then by number. `GET ticket` is the legacy list of the Android app. */
export const searchTickets = (req?: TicketSearchRequest) => {
  return ariesServicesClient.get<TicketList>('ticket/new', { params: req });
};

export const getTicketsMetadata = (req?: TicketSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('ticket/new/metadata', { params: req });
};

/** Time of the open tickets ("ore da svolgere"). */
export const getTicketWorkload = () => {
  return ariesServicesClient.get<TicketWorkload>('ticket/new/workload');
};

export const getTicketById = (id: number, includes?: string) => {
  return ariesServicesClient.get<TicketList>(`ticket/new/${id}`, { params: { includes } });
};

export const createTicket = (data: TicketSaveRequest) => {
  return ariesServicesClient.post<TicketList>('ticket/new', data);
};

export const saveTicket = (id: number, data: TicketSaveRequest) => {
  return ariesServicesClient.put<TicketList>(`ticket/new/${id}`, data);
};

export const setTicketStatus = (id: number, data: TicketStatusSaveRequest) => {
  return ariesServicesClient.put<TicketList>(`ticket/new/${id}/status`, data);
};

export const setTicketPrinted = (id: number, printed: boolean) => {
  return ariesServicesClient.put<TicketList>(`ticket/new/${id}/printed`, { printed });
};

export const deleteTicket = (id: number) => {
  return ariesServicesClient.delete(`ticket/new/${id}`);
};

/** ArrayBuffer: the client response interceptor would mangle a Blob. */
export const getTicketAttachment = (id: number, attachmentId: number) => {
  return ariesServicesClient.get<ArrayBuffer>(`ticket/new/${id}/attachment/${attachmentId}`, {
    responseType: 'arraybuffer',
  });
};

export const getTicketStatuses = () => {
  return ariesServicesClient.get<TicketStatusList>('ticket/status');
};

export const getTicketCausals = () => {
  return ariesServicesClient.get<TicketCausalList>('ticket/causal');
};

export const getInterventionTypes = () => {
  return ariesServicesClient.get<InterventionTypeList>('ticket/intervention-type');
};

export const getTicketRequestChannels = () => {
  return ariesServicesClient.get<TicketRequestChannelList>('ticket/request-channel');
};

export const getTicketCustomerSystems = (customerId: number) => {
  return ariesServicesClient.get<TicketSystemList>(`ticket/customer/${customerId}/systems`);
};

/** Ticket tags containing the text (all of them with an empty text). */
export const searchTicketTags = (search?: string) => {
  return ariesServicesClient.get<TicketTagList>('ticket/tag', { params: { search: search || undefined } });
};

/** The whole list of names: new ones become ticket tags. */
export const saveTicketTags = (id: number, tags: string[]) => {
  return ariesServicesClient.put<TicketList>(`ticket/new/${id}/tags`, { tags });
};

/** Replaces the attachment of the ticket. FormData is not mapped by the client. */
export const uploadTicketAttachment = (id: number, file: File) => {
  const data = new FormData();
  data.append('file', file);
  return ariesServicesClient.post<TicketList>(`ticket/new/${id}/attachment`, data);
};

/** "Fissa a calendario". */
export const scheduleTicketEvent = (id: number, data: TicketEventCreateRequest) => {
  return ariesServicesClient.post<TicketList>(`ticket/new/${id}/event`, data);
};

/** "Preventivo > Genera nuovo": the ticket is closed. */
export const generateTicketQuote = (id: number) => {
  return ariesServicesClient.post<TicketQuoteLink>(`ticket/new/${id}/quote`);
};

/** "Preventivo > Duplica esistente". */
export const cloneTicketQuote = (id: number, quoteId: number, quoteYear: number) => {
  return ariesServicesClient.post<TicketQuoteLink>(`ticket/new/${id}/quote/clone`, { quoteId, quoteYear });
};

/** ArrayBuffer: the client response interceptor would mangle a Blob. */
export const getTicketSummaryPdf = (id: number, scope: TicketPrintScope) => {
  return ariesServicesClient.get<ArrayBuffer>(`ticket/new/${id}/print`, {
    params: { scope },
    responseType: 'arraybuffer',
  });
};

/** CSV of the open tickets expiring between the dates (yyyy-MM-dd), like the Delphi "In scadenza" print. */
export const exportExpiringTickets = (fromDate: string, toDate: string, includeWithoutExpiration: boolean) => {
  return ariesServicesClient.get<ArrayBuffer>('ticket/new/expiring/export', {
    params: { fromDate, toDate, includeWithoutExpiration },
    responseType: 'arraybuffer',
  });
};
