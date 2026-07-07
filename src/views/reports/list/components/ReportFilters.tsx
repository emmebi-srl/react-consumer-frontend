import { MenuItem, TextField } from '@mui/material';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import { useDirtyState, useFilterState, useIsDirty, useResetFilters, useUpdateFilter } from '../state';

const REPORT_STATUSES = [
  { id: 1, name: 'Aperto' },
  { id: 2, name: 'Da fatturare' },
  { id: 3, name: 'Fatturato' },
  { id: 4, name: 'Chiuso' },
  { id: 6, name: 'In garanzia' },
  { id: 12, name: 'Validato' },
];

const ReportFilters: React.FC = () => {
  const filters = useFilterState();
  const dirtyState = useDirtyState();
  const isDirty = useIsDirty();
  const resetFilters = useResetFilters();
  const updateFilter = useUpdateFilter();

  return (
    <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
      <PrimaryFilters dirtyState={dirtyState} additionalFilters={['year', 'statusId', 'customerId', 'systemId']}>
        <InlineSearchFilter name="search" value={filters.search} onChange={updateFilter} sx={{ maxWidth: 410 }} />
      </PrimaryFilters>
      <AdditionalFilters>
        <TextField
          size="small"
          label="Anno"
          value={filters.year ?? ''}
          onChange={(event) => updateFilter('year', event.target.value ? Number(event.target.value) : undefined)}
          type="number"
          sx={{ width: 140 }}
        />
        <TextField
          select
          size="small"
          label="Stato"
          value={filters.statusId ?? ''}
          onChange={(event) => updateFilter('statusId', event.target.value ? Number(event.target.value) : undefined)}
          sx={{ width: 180 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          {REPORT_STATUSES.map((status) => (
            <MenuItem key={status.id} value={status.id}>
              {status.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Cliente"
          value={filters.customerId ?? ''}
          onChange={(event) => updateFilter('customerId', event.target.value ? Number(event.target.value) : undefined)}
          type="number"
          sx={{ width: 140 }}
        />
        <TextField
          size="small"
          label="Impianto"
          value={filters.systemId ?? ''}
          onChange={(event) => updateFilter('systemId', event.target.value ? Number(event.target.value) : undefined)}
          type="number"
          sx={{ width: 140 }}
        />
      </AdditionalFilters>
    </CollapsibleFilters>
  );
};

export default ReportFilters;
