import { Box, MenuItem, TextField, useTheme } from '@mui/material';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import Metadata from '~/components/Table/Metadata';
import { useDdtsMetadata, useDdtStatuses, useTransportCausals } from '~/proxies/aries-proxy/ddts';
import { DdtRecipientType } from '~/types/aries-proxy/ddts';
import {
  toDdtSearchRequest,
  useDirtyState,
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
} from '../state';

const DdtBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();
  const isDirty = useIsDirty();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState();
  const updateFilter = useUpdateFilter();

  const { data: statusData } = useDdtStatuses();
  const { data: causalData } = useTransportCausals();
  const { data } = useDdtsMetadata(toDdtSearchRequest(filters));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 1.5,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: theme.palette.grey[300],
      }}
    >
      <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
        <PrimaryFilters
          dirtyState={dirtyState}
          additionalFilters={['year', 'statusId', 'causalId', 'recipientType', 'fromDate', 'toDate']}
        >
          <InlineSearchFilter
            name="search"
            value={filters.search}
            onChange={updateFilter}
            customLabel="Cerca numero, intestatario, impianto, note o articolo"
            sx={{ maxWidth: 480 }}
          />
        </PrimaryFilters>
        <AdditionalFilters>
          <TextField
            size="small"
            label="Anno"
            value={filters.year ?? ''}
            onChange={(event) => updateFilter('year', event.target.value ? Number(event.target.value) : undefined)}
            type="number"
            sx={{ width: 120 }}
          />
          <TextField
            select
            size="small"
            label="Intestatario"
            value={filters.recipientType ?? ''}
            onChange={(event) =>
              updateFilter('recipientType', (event.target.value || undefined) as DdtRecipientType | undefined)
            }
            sx={{ width: 170 }}
          >
            <MenuItem value="">Clienti e fornitori</MenuItem>
            <MenuItem value="customer">Clienti</MenuItem>
            <MenuItem value="supplier">Fornitori</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Stato"
            value={filters.statusId ?? ''}
            onChange={(event) => updateFilter('statusId', event.target.value ? Number(event.target.value) : undefined)}
            sx={{ width: 160 }}
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
            label="Causale"
            value={filters.causalId ?? ''}
            onChange={(event) => updateFilter('causalId', event.target.value || undefined)}
            sx={{ width: 220 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            {(causalData?.causals ?? []).map((causal) => (
              <MenuItem key={causal.id} value={causal.id}>
                {causal.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Dal"
            type="date"
            value={filters.fromDate ?? ''}
            onChange={(event) => updateFilter('fromDate', event.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />
          <TextField
            size="small"
            label="Al"
            type="date"
            value={filters.toDate ?? ''}
            onChange={(event) => updateFilter('toDate', event.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />
        </AdditionalFilters>
      </CollapsibleFilters>
      <Metadata filteredCount={data?.metadata.filteredCount ?? 0} totalCount={data?.metadata.totalCount ?? 0} />
    </Box>
  );
};

export default DdtBar;
