import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import { useDirtyState, useFilterState, useIsDirty, useResetFilters, useUpdateFilter } from '../state';
import { MenuItem, TextField } from '@mui/material';
import { useQuoteStatuses, useQuoteTypes } from '~/proxies/aries-proxy/quotes';

const QuoteFilters: React.FC = () => {
  const isDirty = useIsDirty();
  const filters = useFilterState();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState();
  const updateFilter = useUpdateFilter();
  const { data: statusData } = useQuoteStatuses();
  const { data: typeData } = useQuoteTypes();

  return (
    <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
      <PrimaryFilters dirtyState={dirtyState} additionalFilters={['year', 'statusId', 'typeId']}>
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
          size="small"
          label="Anno"
          value={filters.year ?? ''}
          onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
          type="number"
          sx={{ width: 140 }}
        />
        <TextField
          select
          size="small"
          label="Stato"
          value={filters.statusId ?? ''}
          onChange={(e) => updateFilter('statusId', e.target.value ? Number(e.target.value) : undefined)}
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
          value={filters.typeId ?? ''}
          onChange={(e) => updateFilter('typeId', e.target.value ? Number(e.target.value) : undefined)}
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

export default QuoteFilters;
