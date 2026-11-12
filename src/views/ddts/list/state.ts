import { createTableState } from '~/state/table';
import { DDT_OPEN_STATUS_IDS, DdtRecipientType, DdtSearchRequest } from '~/types/aries-proxy/ddts';

export interface DdtFilters {
  search: string;
  year?: number;
  statusId?: number;
  /** "Aperti" tab. */
  open?: boolean;
  causalId?: string;
  recipientType?: DdtRecipientType;
  fromDate?: string;
  toDate?: string;
}

/** Search request of the list, metadata and totals: the "Aperti" tab becomes the list of open statuses. */
export const toDdtSearchRequest = ({ open, ...filters }: DdtFilters): DdtSearchRequest => ({
  ...filters,
  statusIds: open ? DDT_OPEN_STATUS_IDS : undefined,
});

export const defaultValues: DdtFilters = {
  search: '',
  year: undefined,
  statusId: undefined,
  causalId: undefined,
  recipientType: undefined,
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
} = createTableState<DdtFilters, 'id'>(defaultValues, { sort: 'id', direction: 'desc' });

/** The aside selection is "year:id", the key of a DDT. */
export const toDdtSelectionId = (ddt: { year: number; id: number }) => `${ddt.year}:${ddt.id}`;

export const parseDdtSelectionId = (selectionId: string | null) => {
  if (!selectionId) return null;
  const [year, id] = selectionId.split(':').map(Number);
  return year && id ? { year, id } : null;
};

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
