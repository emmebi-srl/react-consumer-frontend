import { createTableState } from '~/state/table';

export interface ReportFilters {
  search: string;
  year?: number;
  statusId?: number;
  customerId?: number;
  systemId?: number;
}

export const defaultValues: ReportFilters = {
  search: '',
  year: undefined,
  statusId: undefined,
  customerId: undefined,
  systemId: undefined,
};

const {
  useActiveId,
  useActivate,
  useDirtyState,
  useFilterState,
  useIsActive,
  useIsDirty,
  useIsSidebarOpen,
  useResetFilters,
  useResetSelection,
  useUpdateFilter,
} = createTableState<ReportFilters, 'id'>(defaultValues, { sort: 'id', direction: 'desc' });

export {
  useActiveId,
  useActivate,
  useDirtyState,
  useFilterState,
  useIsActive,
  useIsDirty,
  useIsSidebarOpen,
  useResetFilters,
  useResetSelection,
  useUpdateFilter,
};
