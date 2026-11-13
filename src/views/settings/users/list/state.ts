import { createTableState } from '~/state/table';

export interface UsersFilters {
  search: string;
}

export const defaultValues: UsersFilters = {
  search: '',
};

const { useFilterState, useIsDirty, useResetFilters, useSetFilterState, useUpdateFilter, useDirtyState } =
  createTableState<UsersFilters, 'username'>(defaultValues, { sort: 'username', direction: 'asc' });

export { useFilterState, useIsDirty, useResetFilters, useSetFilterState, useUpdateFilter, useDirtyState };
