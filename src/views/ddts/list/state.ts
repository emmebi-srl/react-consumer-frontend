import { createTableState } from '~/state/table';
import { DdtRecipientType } from '~/types/aries-proxy/ddts';

export interface DdtFilters {
  search: string;
  year?: number;
  statusId?: number;
  causalId?: string;
  recipientType?: DdtRecipientType;
  fromDate?: string;
  toDate?: string;
}

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
