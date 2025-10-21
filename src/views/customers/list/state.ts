import { createTableState } from '~/state/table';

export interface CustomersFilters {
  search: string;
}

export const defaultValues: CustomersFilters = {
  search: '',
};

const { useFilterState, useIsDirty, useResetFilters, useSetFilterState, useUpdateFilter, useDirtyState } =
  createTableState<CustomersFilters, 'id'>(defaultValues, { sort: 'id', direction: 'asc' });

export { useFilterState, useIsDirty, useResetFilters, useSetFilterState, useUpdateFilter, useDirtyState };
