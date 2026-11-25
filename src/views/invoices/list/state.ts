import { createTableState } from '~/state/table';
import { INVOICE_OPEN_STATUS_IDS, InvoiceKind, InvoiceSearchRequest } from '~/types/aries-proxy/invoices';

export interface InvoiceFilters {
  search: string;
  year?: number;
  /** Tab: "Fatture" (invoice) or "Prefatture" (preinvoice); none = both. */
  kind?: InvoiceKind;
  /** "Da incassare" tab. */
  open?: boolean;
  statusId?: number;
  typeId?: number;
  causalId?: number;
  paymentConditionId?: number;
  isSent?: boolean;
  fromDate?: string;
  toDate?: string;
}

/** Search request of list, metadata and totals: the "Da incassare" tab becomes the list of open statuses. */
export const toInvoiceSearchRequest = ({ open, ...filters }: InvoiceFilters): InvoiceSearchRequest => ({
  ...filters,
  kind: open ? 'invoice' : filters.kind,
  statusIds: open ? INVOICE_OPEN_STATUS_IDS : undefined,
});

export const defaultValues: InvoiceFilters = {
  search: '',
  year: undefined,
  kind: 'invoice',
  open: undefined,
  statusId: undefined,
  typeId: undefined,
  causalId: undefined,
  paymentConditionId: undefined,
  isSent: undefined,
  fromDate: undefined,
  toDate: undefined,
};

const {
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
  useDirtyState,
  useActiveId,
  useIsSidebarOpen,
  useIsActive,
  useActivate,
  useResetSelection,
} = createTableState<InvoiceFilters, 'id'>(defaultValues, { sort: 'id', direction: 'desc' });

/** The aside selection is "year:id", the key of an invoice (year 0 = preinvoice). */
export const toInvoiceSelectionId = (invoice: { year: number; id: number }) => `${invoice.year}:${invoice.id}`;

export const parseInvoiceSelectionId = (selectionId: string | null) => {
  if (!selectionId) return null;
  const [year, id] = selectionId.split(':').map(Number);
  return year !== undefined && !Number.isNaN(year) && id ? { year, id } : null;
};

/** "12/2025", or "Prefattura 12" for year 0. */
export const formatInvoiceNumber = (invoice: { year: number; id: number }) =>
  invoice.year === 0 ? `Prefattura ${invoice.id}` : `${invoice.id}/${invoice.year}`;

export {
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
  useDirtyState,
  useActiveId,
  useIsSidebarOpen,
  useIsActive,
  useActivate,
  useResetSelection,
};
