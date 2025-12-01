import { createTableState } from '~/state/table';

export interface CustomersFilters {
  search: string;
  active?: boolean;
}

export const defaultValues: CustomersFilters = {
  search: '',
  active: undefined,
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
} = createTableState<CustomersFilters, 'id'>(defaultValues, { sort: 'id', direction: 'asc' });

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
