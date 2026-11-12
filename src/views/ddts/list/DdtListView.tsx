import { useMemo, useRef, useState } from 'react';
import { Alert, Stack, TableCell, Tooltip } from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import DdtTabs from './components/DdtTabs';
import PageContainer from '~/components/Layout/PageContainer';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { useDdtsSearch } from '~/proxies/aries-proxy/ddts';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { Ddt } from '~/types/aries-proxy/ddts';
import { AriesModule } from '~/types/aries-proxy/users';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import DdtBar from './components/DdtBar';
import DdtTableHeading from './components/DdtTableHeading';
import DdtTotalsCards from './components/DdtTotalsCards';
import DdtTableRow from './components/DdtTableRow';
import DdtAside from './components/DdtAside';
import { toDdtSearchRequest, useFilterState, useIsSidebarOpen } from './state';

const DdtTableComponents: TableComponents<Ddt> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <DdtTableRow item={item} {...props} />,
};

const DdtTableRowContent: React.FC<{ ddt: Ddt }> = ({ ddt }) => {
  const isSupplier = !!ddt.supplierId;
  const recipientName = isSupplier ? ddt.supplierName : ddt.customerName;
  const destination = isSupplier ? ddt.supplierDestination : ddt.destination;
  const municipality = [destination?.postalCode, destination?.municipality].filter(Boolean).join(' - ');
  const municipalityLabel = destination?.province ? `${municipality} (${destination.province})` : municipality;

  return (
    <>
      <TableCell align="right" width={80}>
        <MainLabel>{ddt.id}</MainLabel>
        <SecondaryLabel>{ddt.year}</SecondaryLabel>
      </TableCell>
      <TableCell width={130}>
        <DelphiColorChip label={ddt.status?.name ?? String(ddt.statusId)} delphiColor={ddt.status?.color} />
      </TableCell>
      <TableCell width={110}>
        <MainLabel>{getStringDateByUnixtimestamp(ddt.documentDate) || '-'}</MainLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 220 }}>
        <MainLabel title={recipientName ?? undefined}>{recipientName ?? '-'}</MainLabel>
        <SecondaryLabel>{isSupplier ? 'Fornitore' : 'Cliente'}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 150 }}>
        <SecondaryLabel title={ddt.causal?.name}>{ddt.causal?.name ?? ddt.causalId ?? '-'}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 200 }}>
        <MainLabel title={municipalityLabel}>{municipalityLabel || '-'}</MainLabel>
        <SecondaryLabel title={destination?.street ?? undefined}>{destination?.street}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 150 }}>
        <SecondaryLabel title={ddt.systemDescription ?? undefined}>{ddt.systemDescription ?? '-'}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 150 }}>
        <SecondaryLabel title={ddt.description ?? undefined}>{ddt.description || '-'}</SecondaryLabel>
      </TableCell>
      <TableCell align="center" width={90}>
        {ddt.isPrinted ? (
          <Tooltip title="Stampato">
            <CheckCircleOutlined color="success" fontSize="small" />
          </Tooltip>
        ) : null}
      </TableCell>
    </>
  );
};

/** DDTs issued to customers and suppliers, like the Delphi "DDT" screen. A click on a row opens the summary aside. */
const DdtListView = () => {
  const filters = useFilterState();
  const isSidebarOpen = useIsSidebarOpen();
  const { permission } = useModulePermission(AriesModule.Ddts);
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);

  const queryParams = useMemo(
    () => ({ ...toDdtSearchRequest(filters), includes: 'customer,supplier,status,causal,destination,system' }),
    [filters],
  );
  const ddtsQuery = useDdtsSearch(queryParams);
  const ddts = ddtsQuery.data?.pages.flatMap((page) => page.ddts) ?? [];

  return (
    <SplitLayout>
      <SplitMain sidebarOpen={isSidebarOpen} ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <DdtTabs onRefresh={() => ddtsQuery.refetch()} refreshing={ddtsQuery.isFetching} />

            {permission?.canTotals ? <DdtTotalsCards /> : null}

            {ddtsQuery.isError ? <Alert severity="error">Non sono riuscito a caricare i DDT.</Alert> : null}

            <ScrollToTopButton
              onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
              visible={!topReached}
            />

            <DataTableContainer>
              <TableVirtuoso<Ddt>
                ref={virtuoso}
                atTopStateChange={setTopReached}
                customScrollParent={scrollerRef.current || undefined}
                data={ddts}
                components={DdtTableComponents}
                endReached={() => {
                  if (!ddtsQuery.hasNextPage || ddtsQuery.isFetching) return;
                  ddtsQuery.fetchNextPage();
                }}
                fixedHeaderContent={() => (
                  <DdtTableHeading>
                    <DdtBar />
                  </DdtTableHeading>
                )}
                computeItemKey={(_index, ddt) => `${ddt.year}-${ddt.id}`}
                itemContent={(_index, ddt) => <DdtTableRowContent ddt={ddt} />}
              />
            </DataTableContainer>
          </Stack>
        </PageContainer>
        <DdtAside />
      </SplitMain>
    </SplitLayout>
  );
};

export default DdtListView;
