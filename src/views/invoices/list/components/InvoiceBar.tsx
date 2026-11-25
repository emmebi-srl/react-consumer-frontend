import { Box, MenuItem, TextField, useTheme } from '@mui/material';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import Metadata from '~/components/Table/Metadata';
import { useInvoiceLookups, useInvoicesMetadata } from '~/proxies/aries-proxy/invoices';
import {
  toInvoiceSearchRequest,
  useDirtyState,
  useFilterState,
  useIsDirty,
  useResetFilters,
  useUpdateFilter,
} from '../state';

const toNumber = (value: string) => (value ? Number(value) : undefined);

const InvoiceBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();
  const isDirty = useIsDirty();
  const resetFilters = useResetFilters();
  // The tabs are not filters of "Più filtri".
  const dirtyState = useDirtyState(['kind', 'open']);
  const updateFilter = useUpdateFilter();
  const { data: lookups } = useInvoiceLookups();
  const { data } = useInvoicesMetadata(toInvoiceSearchRequest(filters));

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
            'typeId',
            'causalId',
            'paymentConditionId',
            'isSent',
            'fromDate',
            'toDate',
          ]}
        >
          <InlineSearchFilter
            name="search"
            value={filters.search}
            onChange={updateFilter}
            customLabel="Cerca numero, cliente, note o righe"
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
            sx={{ width: 200 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {(lookups?.statuses ?? []).map((status) => (
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
            onChange={(event) => updateFilter('typeId', toNumber(event.target.value))}
            sx={{ width: 220 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {(lookups?.types ?? []).map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Causale"
            value={filters.causalId ?? ''}
            onChange={(event) => updateFilter('causalId', toNumber(event.target.value))}
            sx={{ width: 220 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            {(lookups?.causals ?? []).map((causal) => (
              <MenuItem key={causal.id} value={causal.id}>
                {causal.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Pagamento"
            value={filters.paymentConditionId ?? ''}
            onChange={(event) => updateFilter('paymentConditionId', toNumber(event.target.value))}
            sx={{ width: 240 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {(lookups?.paymentConditions ?? []).map((condition) => (
              <MenuItem key={condition.id} value={condition.id}>
                {condition.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Invio"
            value={filters.isSent === undefined ? '' : filters.isSent ? 'yes' : 'no'}
            onChange={(event) =>
              updateFilter('isSent', event.target.value === '' ? undefined : event.target.value === 'yes')
            }
            sx={{ width: 160 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            <MenuItem value="yes">Inviate</MenuItem>
            <MenuItem value="no">Da inviare</MenuItem>
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

export default InvoiceBar;
