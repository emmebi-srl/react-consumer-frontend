import { createTableState } from '~/state/table';

export interface ProductsFilters {
  search: string;
  statusId?: number;
  brandId?: string;
  categoryId?: number;
  subcategoryId?: number;
  isKit?: boolean;
}

export const defaultValues: ProductsFilters = {
  search: '',
  statusId: undefined,
  brandId: undefined,
  categoryId: undefined,
  subcategoryId: undefined,
  isKit: undefined,
};

const { useFilterState, useIsDirty, useResetFilters, useSetFilterState, useUpdateFilter, useDirtyState } =
  createTableState<ProductsFilters, 'productCode'>(defaultValues, { sort: 'productCode', direction: 'asc' });

export { useFilterState, useIsDirty, useResetFilters, useSetFilterState, useUpdateFilter, useDirtyState };
