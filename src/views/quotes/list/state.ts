import { createTableState } from '~/state/table';

export interface QuoteFilters {
  search: string;
  year?: number;
  statusId?: number;
  typeId?: number;
}

export const defaultValues: QuoteFilters = {
  search: '',
  year: undefined,
  statusId: undefined,
  typeId: undefined,
};

const {
  useFilterState,
  useIsDirty,
  useResetFilters,
  useSetFilterState,
  useUpdateFilter,
  useDirtyState,
  useActiveId,
  useIsSidebarOpen,
  useIsActive,
  useActivate,
  useResetSelection,
} = createTableState<QuoteFilters, 'id'>(defaultValues, { sort: 'id', direction: 'asc' });

export {
  useFilterState,
  useIsDirty,
  useResetFilters,
  useSetFilterState,
  useUpdateFilter,
  useDirtyState,
  useActiveId,
  useIsActive,
  useActivate,
  useIsSidebarOpen,
  useResetSelection,
};
