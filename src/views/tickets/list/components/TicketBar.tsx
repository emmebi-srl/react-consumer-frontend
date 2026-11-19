import { Autocomplete, Box, MenuItem, TextField, useTheme } from '@mui/material';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import Metadata from '~/components/Table/Metadata';
import {
  useInterventionTypes,
  useTicketCausals,
  useTicketOpenStatusIds,
  useTicketsMetadata,
  useTicketStatuses,
  useTicketTagsSearch,
} from '~/proxies/aries-proxy/tickets';
import { TICKET_URGENCY_LABELS, TicketUrgency } from '~/types/aries-proxy/tickets';
import {
  toTicketSearchRequest,
  useDirtyState,
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
} from '../state';

const toNumber = (value: string) => (value === '' ? undefined : Number(value));

const TicketBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();
  const isDirty = useIsDirty();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState(['open', 'expired']);
  const { data: tags } = useTicketTagsSearch('');
  const updateFilter = useUpdateFilter();

  const { data: statuses } = useTicketStatuses();
  const { data: causals } = useTicketCausals();
  const { data: interventionTypes } = useInterventionTypes();
  const openStatusIds = useTicketOpenStatusIds();
  const request = toTicketSearchRequest(filters, openStatusIds);
  const { data } = useTicketsMetadata(request ?? undefined, { enabled: !!request });

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
          additionalFilters={[
            'year',
            'statusId',
            'causalId',
            'interventionTypeId',
            'urgency',
            'tagId',
            'fromDate',
            'toDate',
          ]}
        >
          <InlineSearchFilter
            name="search"
            value={filters.search}
            onChange={updateFilter}
            customLabel="Cerca numero, cliente, impianto o descrizione"
            sx={{ maxWidth: 480 }}
          />
        </PrimaryFilters>
        <AdditionalFilters>
          <TextField
            size="small"
            label="Anno"
            value={filters.year ?? ''}
            onChange={(event) => updateFilter('year', toNumber(event.target.value))}
            type="number"
            sx={{ width: 120 }}
          />
          <TextField
            select
            size="small"
            label="Stato"
            value={filters.statusId ?? ''}
            onChange={(event) => updateFilter('statusId', toNumber(event.target.value))}
            sx={{ width: 160 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {(statuses ?? []).map((status) => (
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
            onChange={(event) => updateFilter('causalId', toNumber(event.target.value))}
            sx={{ width: 180 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            {(causals ?? []).map((causal) => (
              <MenuItem key={causal.id} value={causal.id}>
                {causal.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Tipo intervento"
            value={filters.interventionTypeId ?? ''}
            onChange={(event) => updateFilter('interventionTypeId', toNumber(event.target.value))}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {(interventionTypes ?? []).map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Urgenza"
            value={filters.urgency ?? ''}
            onChange={(event) => updateFilter('urgency', toNumber(event.target.value))}
            sx={{ width: 140 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            {[TicketUrgency.Low, TicketUrgency.Medium, TicketUrgency.High].map((urgency) => (
              <MenuItem key={urgency} value={urgency}>
                {TICKET_URGENCY_LABELS[urgency]}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            size="small"
            options={tags ?? []}
            value={(tags ?? []).find((tag) => tag.id === filters.tagId) ?? null}
            getOptionLabel={(tag) => tag.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => updateFilter('tagId', value?.id)}
            renderInput={(params) => <TextField {...params} label="Tag" />}
            sx={{ width: 200 }}
          />
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

export default TicketBar;
