import { CustomerDestination } from './customers';

/** stato_ticket */
export interface TicketStatus {
  id: number;
  name: string;
  description?: string | null;
  /** Raw Delphi color: convert it with DelphiColorChip / color-utils. */
  color: string;
  /** The "Aperti" tab sends the open statuses. */
  isOpen: boolean;
}

/** `GET ticket/status` (shared with the Android app: the list key is `list`). */
export interface TicketStatusList {
  list: TicketStatus[];
}

/** causale_ticket */
export interface TicketCausal {
  id: number;
  name: string;
  description?: string | null;
}

export interface TicketCausalList {
  causals: TicketCausal[];
}

/** tipo_intervento */
export interface InterventionType {
  id: number;
  name: string;
  description?: string | null;
}

export interface InterventionTypeList {
  interventionTypes: InterventionType[];
}

/** pervenuta_per: "Richiesta pervenuta per". */
export interface TicketRequestChannel {
  id: number;
  name: string;
}

export interface TicketRequestChannelList {
  requestChannels: TicketRequestChannel[];
}

export interface TicketSystem {
  id: number;
  description?: string | null;
}

export interface TicketSystemList {
  systems: TicketSystem[];
}

export enum TicketUrgency {
  Low = 0,
  Medium = 1,
  High = 2,
}

export const TICKET_URGENCY_LABELS: Record<TicketUrgency, string> = {
  [TicketUrgency.Low]: 'Bassa',
  [TicketUrgency.Medium]: 'Media',
  [TicketUrgency.High]: 'Alta',
};

/** ticket.inviato, Delphi TSendTypeEnum. */
export enum TicketSentType {
  None = 0,
  Email = 1,
  ByHand = 2,
  Post = 3,
  Fax = 4,
}

export const TICKET_SENT_TYPE_LABELS: Record<TicketSentType, string> = {
  [TicketSentType.None]: 'Non inviato',
  [TicketSentType.Email]: 'Email',
  [TicketSentType.ByHand]: 'A mano',
  [TicketSentType.Post]: 'Posta',
  [TicketSentType.Fax]: 'Fax',
};

export type TicketDocumentType = 'report' | 'quote';

/** A report or quote linked to the ticket ("Documenti" of the Delphi screen). */
export interface TicketDocument {
  type: TicketDocumentType;
  id: number;
  year: number;
  /** Displayed number of a report. */
  number?: string | null;
  date?: number | null;
  description?: string | null;
  isCompleted?: boolean | null;
  linkType?: number | null;
}

export interface TicketAttachment {
  id: number;
  fileName: string;
  createdAt: number;
  /** False when the file is missing on the server. */
  exists: boolean;
}

/**
 * `ticket/new` items. Some names come from the legacy contract shared with the Android app:
 * `communicatedVia` is the request channel, `rememberMeDate` the reminder date.
 */
export interface Ticket {
  /** ticket.Id: the key of the web routes. */
  id: number;
  /** Number within the year. */
  ticketId: number;
  ticketYear: number;
  /** Displayed number (num_tick). */
  ticketNumber?: string | null;
  systemId?: number | null;
  customerId: number;
  destinationId?: number | null;
  urgency: TicketUrgency;
  description?: string | null;
  expirationDate?: number | null;
  interventionTypeId: number;
  causalId: number;
  createdDatetime: number;
  communicatedVia: number;
  statusId: number;
  printed: boolean;
  sent: boolean;
  sentTypeId?: TicketSentType | null;
  rememberMeDate?: number | null;
  createdUser?: number | null;
  ticketDate?: number | null;
  solutionDate?: number | null;
  workMinutes?: number | null;
  customerName?: string | null;
  systemDescription?: string | null;
  status?: TicketStatus | null;
  causal?: TicketCausal | null;
  interventionType?: InterventionType | null;
  requestChannel?: TicketRequestChannel | null;
  destination?: CustomerDestination | null;
  documents?: TicketDocument[] | null;
  attachments?: TicketAttachment[] | null;
  tags?: TicketTag[] | null;
  events?: TicketEvent[] | null;
  /** Only when the ticket has a system. */
  systemConditions?: TicketSystemConditions | null;
}

export interface TicketTag {
  id: number;
  name: string;
}

export interface TicketTagList {
  tags: TicketTag[];
}

/** "ticket" = fixed with "Fissa a calendario"; reminder / expiration are written by the database for the dates. */
export type TicketEventKind = 'ticket' | 'reminder' | 'expiration';

export interface TicketEvent {
  id: number;
  kind: TicketEventKind;
  subject: string;
  executionDate: number;
  /** HH:mm */
  startTime: string;
  endTime: string;
  wasPerformed: boolean;
  employees: { employeeId: number; name?: string | null }[];
}

/** "Impianto" box of the Delphi form, for the current year. */
export interface TicketSystemConditions {
  year: number;
  /** null = not subscribed ("NON ABBONATO"). */
  subscriptionName?: string | null;
  callRightAmount: number;
  firstHourAmount: number;
  maintenanceAmount: number;
  periodicChecks: number;
  periodicChecksDone: number;
  nextPeriodicCheckDate?: number | null;
}

export interface TicketEventCreateRequest {
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm */
  startTime: string;
  endTime: string;
  employeeIds: number[];
  note?: string | null;
}

export interface TicketQuoteLink {
  quoteId: number;
  quoteYear: number;
}

/** "Riepilogo" prints of the Delphi screen: the ticket system, the systems with open tickets, every system of the customer. */
export type TicketPrintScope = 'system' | 'customer' | 'customer_systems';

export interface TicketList {
  list: Ticket[];
}

export interface TicketSearchRequest {
  search?: string;
  year?: number;
  statusId?: number;
  /** Any of these statuses (query string statusIds=1&statusIds=2). */
  statusIds?: number[];
  causalId?: number;
  interventionTypeId?: number;
  urgency?: TicketUrgency;
  customerId?: number;
  systemId?: number;
  fromDate?: string;
  toDate?: string;
  /** Expiration date before today. */
  expired?: boolean;
  tagId?: number;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** Dates as yyyy-MM-dd. Full replacement on update: status, printed and sending have their own requests. */
export interface TicketSaveRequest {
  customerId: number;
  systemId?: number | null;
  /** Empty = the ticket number. */
  ticketNumber?: string | null;
  ticketDate?: string | null;
  description: string;
  causalId: number;
  interventionTypeId: number;
  requestChannelId: number;
  urgency: TicketUrgency;
  expirationDate?: string | null;
  solutionDate?: string | null;
  reminderDate?: string | null;
  workMinutes: number;
}

export interface TicketStatusSaveRequest {
  statusId: number;
  sentTypeId: TicketSentType;
  /** yyyy-MM-dd; null clears it. */
  solutionDate?: string | null;
}

export interface TicketWorkload {
  openWorkMinutes: number;
}
