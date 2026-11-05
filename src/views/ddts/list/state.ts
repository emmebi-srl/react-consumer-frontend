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

const { useFilterState, useIsDirty, useResetFilters, useUpdateFilter, useDirtyState } = createTableState<
  DdtFilters,
  'id'
>(defaultValues, { sort: 'id', direction: 'desc' });

export { useFilterState, useIsDirty, useResetFilters, useUpdateFilter, useDirtyState };
