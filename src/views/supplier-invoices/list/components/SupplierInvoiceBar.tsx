import { Box, MenuItem, TextField, useTheme } from '@mui/material';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import Metadata from '~/components/Table/Metadata';
import {
  useSupplierInvoiceCausals,
  useSupplierInvoicesMetadata,
  useSupplierInvoiceStatuses,
  useSupplierInvoiceTypes,
} from '~/proxies/aries-proxy/supplier-invoices';
import { useDirtyState, useFilterState, useIsDirty, useResetFilters, useUpdateFilter } from '../state';

const SupplierInvoiceBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();
  const isDirty = useIsDirty();
  const resetFilters = useResetFilters();
  const dirtyState = useDirtyState();
  const updateFilter = useUpdateFilter();

  const { data: statusData } = useSupplierInvoiceStatuses();
  const { data: typeData } = useSupplierInvoiceTypes();
  const { data: causalData } = useSupplierInvoiceCausals();

  const { data } = useSupplierInvoicesMetadata({
    search: filters.search,
    year: filters.year,
    statusId: filters.statusId,
    typeId: filters.typeId,
    causalId: filters.causalId,
  });

  const filteredCount = data?.metadata.filteredCount ?? 0;
  const totalCount = data?.metadata.totalCount ?? 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      pt={1.5}
      bgcolor="white"
      borderBottom="1px solid"
      borderColor={theme.palette.grey[300]}
    >
      <CollapsibleFilters onClearFilters={resetFilters} isDirty={isDirty}>
        <PrimaryFilters dirtyState={dirtyState} additionalFilters={['year', 'statusId', 'typeId', 'causalId']}>
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
            onChange={(event) => updateFilter('typeId', event.target.value ? Number(event.target.value) : undefined)}
            sx={{ width: 180 }}
          >
            <MenuItem value="">Tutti</MenuItem>
            {(typeData?.types ?? []).map((type) => (
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
            onChange={(event) => updateFilter('causalId', event.target.value ? Number(event.target.value) : undefined)}
            sx={{ width: 190 }}
          >
            <MenuItem value="">Tutte</MenuItem>
            {(causalData?.causals ?? []).map((causal) => (
              <MenuItem key={causal.id} value={causal.id}>
                {causal.name}
              </MenuItem>
            ))}
          </TextField>
        </AdditionalFilters>
      </CollapsibleFilters>
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

export default SupplierInvoiceBar;
