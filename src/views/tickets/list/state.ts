import { createTableState } from '~/state/table';
import { TicketSearchRequest, TicketUrgency } from '~/types/aries-proxy/tickets';

export const EXPIRED_TAB_KEY = 'expired';

export interface TicketFilters {
  search: string;
  year?: number;
  statusId?: number;
  /** "Aperti" tab. */
  open?: boolean;
  /** "Scaduti" tab: open tickets with the expiration date before today. */
  expired?: boolean;
  causalId?: number;
  interventionTypeId?: number;
  urgency?: TicketUrgency;
  tagId?: number;
  fromDate?: string;
  toDate?: string;
}

/**
 * Search request of the list and its metadata. The open statuses come from `ticket/status` (`isOpen`): until they are
 * loaded the "Aperti" / "Scaduti" request can't be built, so it returns null.
 */
export const toTicketSearchRequest = (
  { open, expired, ...filters }: TicketFilters,
  openStatusIds: number[] | undefined,
): TicketSearchRequest | null => {
  if ((open || expired) && !openStatusIds) return null;
  return {
    ...filters,
    statusIds: open || expired ? openStatusIds : undefined,
    expired: expired || undefined,
  };
};

export const defaultValues: TicketFilters = {
  search: '',
  year: undefined,
  statusId: undefined,
  open: undefined,
  expired: undefined,
  causalId: undefined,
  interventionTypeId: undefined,
  urgency: undefined,
  tagId: undefined,
  fromDate: undefined,
  toDate: undefined,
};

const {
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
  useSetFilterState,
  useDirtyState,
  useActiveId,
  useIsSidebarOpen,
  useIsActive,
  useActivate,
  useResetSelection,
} = createTableState<TicketFilters, 'id'>(defaultValues, { sort: 'id', direction: 'desc' });

/** The aside selection is the ticket id (ticket.Id). */
export const toTicketSelectionId = (ticket: { id: number }) => String(ticket.id);

export const parseTicketSelectionId = (selectionId: string | null) => {
  const id = Number(selectionId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export {
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
  useSetFilterState,
  useDirtyState,
  useActiveId,
  useIsSidebarOpen,
  useIsActive,
  useActivate,
  useResetSelection,
};
