import { createTableState } from '~/state/table';

export interface SupplierInvoiceFilters {
  search: string;
  year?: number;
  statusId?: number;
  typeId?: number;
  causalId?: number;
}

export const defaultValues: SupplierInvoiceFilters = {
  search: '',
  year: undefined,
  statusId: undefined,
  typeId: undefined,
  causalId: undefined,
};

const { useFilterState, useIsDirty, useResetFilters, useUpdateFilter, useDirtyState } = createTableState<
  SupplierInvoiceFilters,
  'id'
>(defaultValues, { sort: 'id', direction: 'desc' });

export { useFilterState, useIsDirty, useResetFilters, useUpdateFilter, useDirtyState };
