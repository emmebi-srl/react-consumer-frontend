import { MenuItem, TextField } from '@mui/material';
import { useFilterState, useUpdateFilter, useIsDirty, useResetFilters, useDirtyState } from '../state';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import { useCustomerStatuses, useCustomerTypes } from '~/proxies/aries-proxy/customers';

const CustomerFilters: React.FC = () => {
  const isDirty = useIsDirty();
  const filters = useFilterState();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState();
  const updateFilter = useUpdateFilter();
  const { data: statusData } = useCustomerStatuses();
  const { data: typeData } = useCustomerTypes();

  return (
    <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
      <PrimaryFilters dirtyState={dirtyState} additionalFilters={['statusId', 'customerTypeId']}>
        <InlineSearchFilter
          name="search"
          value={filters.search}
          onChange={updateFilter}
          sx={{
            maxWidth: 410,
          }}
        />
      </PrimaryFilters>
      <AdditionalFilters>
        <TextField
          select
          size="small"
          label="Stato"
          value={filters.statusId ?? ''}
          onChange={(e) => updateFilter('statusId', e.target.value ? e.target.value : undefined)}
          sx={{ width: 180 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          {(statusData?.statuses ?? []).map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Tipo"
          value={filters.customerTypeId ?? ''}
          onChange={(e) => updateFilter('customerTypeId', e.target.value ? Number(e.target.value) : undefined)}
          sx={{ width: 180 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          {(typeData?.types ?? []).map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>
      </AdditionalFilters>
    </CollapsibleFilters>
  );
};

export default CustomerFilters;
