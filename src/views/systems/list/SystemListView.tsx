import { Stack, TableCell } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import CollapsibleFilters, { AdditionalFilters, PrimaryFilters } from '~/components/Filters/CollapsibleFilters';
import InlineSearchFilter from '~/components/Filters/InlineSearchFilter';
import PageContainer from '~/components/Layout/PageContainer';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import DetailDataCell from '~/components/Table/DetailDataCell';
import LabelWithTooltip from '~/components/Table/LabelWithTooltip';
import Metadata from '~/components/Table/Metadata';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useSystems, useSystemsMetadata } from '~/proxies/aries-proxy/systems';
import { System } from '~/types/aries-proxy/systems';

const SystemsTableComponents: TableComponents<System> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const SystemTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DataTableHeading
      order="asc"
      orderBy="id"
      headLabel={[
        { id: 'id', label: 'ID', align: 'right' },
        { id: 'companyName', label: 'Cliente', align: 'left' },
        { id: 'description', label: 'Impianto', align: 'left' },
        { id: 'statusDescription', label: 'Stato', align: 'left' },
        { id: 'destination', label: 'Destinazione', align: 'left' },
      ]}
      numSelected={0}
      rowCount={0}
      onRequestSort={() => {}}
      onSelectAllClick={() => {}}
      select={false}
    >
      {children}
    </DataTableHeading>
  );
};

const SystemFiltersBar: React.FC<{
  search: string;
  filteredCount: number;
  totalCount: number;
  onChange: (value: string) => void;
  onReset: () => void;
}> = ({ search, filteredCount, totalCount, onChange, onReset }) => {
  return (
    <Stack pt={1.5} bgcolor="white" borderBottom="1px solid" borderColor="grey.300">
      <CollapsibleFilters onClearFilters={onReset} isDirty={search.trim().length > 0}>
        <PrimaryFilters dirtyState={{ search }} additionalFilters={[]}>
          <InlineSearchFilter
            name="search"
            value={search}
            onChange={(_name, value) => onChange(value)}
            customLabel="Cerca ID impianto, cliente o descrizione"
            sx={{ maxWidth: 460 }}
          />
        </PrimaryFilters>
        <AdditionalFilters />
      </CollapsibleFilters>
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Stack>
  );
};

const getDestinationLabel = (system: System) => {
  if (!system.destination) {
    return 'Destinazione non disponibile';
  }

  return [system.destination.municipality, system.destination.province, system.destination.street]
    .filter(Boolean)
    .join(' - ');
};

const SystemTableRowContent: React.FC<{ system: System }> = ({ system }) => {
  const customerLabel = system.customer?.companyName || system.companyName;
  const customerDetails = system.customer?.vat ? `P.IVA ${system.customer.vat}` : system.customer?.taxCode || '';
  const destinationLabel = getDestinationLabel(system);

  return (
    <>
      <TableCell align="right" width={90}>
        <MainLabel>{system.id}</MainLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0 }}>
        <MainLabel>{customerLabel}</MainLabel>
        {customerDetails ? <SecondaryLabel>{customerDetails}</SecondaryLabel> : null}
      </TableCell>
      <TableCell sx={{ maxWidth: 0 }}>
        <MainLabel>{system.typeDescription || '-'}</MainLabel>
        <SecondaryLabel>{system.description}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ width: 250, maxWidth: 250 }}>
        <DetailDataCell sx={{ overflow: 'hidden' }}>
          <LabelWithTooltip variant="secondary" label={system.statusDescription || '-'} />
        </DetailDataCell>
      </TableCell>
      <TableCell sx={{ maxWidth: 0 }}>
        <DetailDataCell sx={{ overflow: 'hidden' }}>
          <LabelWithTooltip variant="secondary" label={destinationLabel} />
        </DetailDataCell>
      </TableCell>
    </>
  );
};

const SystemListView = () => {
  const [topReached, setTopReached] = useState(true);
  const [search, setSearch] = useState('');
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const queryParams = useMemo(
    () => ({
      includes: 'customer',
      search: search || undefined,
    }),
    [search],
  );

  const systemsQuery = useSystems(queryParams);
  const systemsMetadataQuery = useSystemsMetadata(queryParams);

  const systems = useMemo(
    () => systemsQuery.data?.pages.flatMap((page) => page.systems) ?? [],
    [systemsQuery.data?.pages],
  );
  const totalCount = systemsMetadataQuery.data?.metadata.totalCount ?? 0;
  const filteredCount = systemsMetadataQuery.data?.metadata.filteredCount ?? 0;

  return (
    <PageContainer>
      <Stack spacing={3} direction="column" flexGrow={1}>
        <ScrollToTopButton
          onClick={() => {
            virtuoso.current?.scrollToIndex({
              index: 0,
              align: 'start',
              behavior: 'smooth',
            });
          }}
          visible={!topReached}
        />
        <DataTableContainer>
          <TableVirtuoso<System>
            ref={virtuoso}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{
              main: 1000,
              reverse: 1000,
            }}
            components={SystemsTableComponents}
            data={systems}
            endReached={() => {
              if (!systemsQuery.hasNextPage || systemsQuery.isFetching) {
                return;
              }

              systemsQuery.fetchNextPage();
            }}
            fixedHeaderContent={() => (
              <SystemTableHeading>
                <SystemFiltersBar
                  search={search}
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  onChange={setSearch}
                  onReset={() => setSearch('')}
                />
              </SystemTableHeading>
            )}
            computeItemKey={(_index, system) => system.id}
            itemContent={(_index, system) => <SystemTableRowContent system={system} />}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};

export default SystemListView;
