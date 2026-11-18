import { useMemo, useRef, useState } from 'react';
import { Alert, Chip, Stack, TableCell, Tooltip } from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import PageContainer from '~/components/Layout/PageContainer';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { TicketListIncludes, useTicketOpenStatusIds, useTicketsSearch } from '~/proxies/aries-proxy/tickets';
import { Ticket } from '~/types/aries-proxy/tickets';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import { getUrgencyColor, getUrgencyLabel, isTicketExpired } from '../ticketHelpers';
import TicketAside from './components/TicketAside';
import TicketBar from './components/TicketBar';
import TicketPeriodicChecks from './components/TicketPeriodicChecks';
import TicketTableHeading from './components/TicketTableHeading';
import TicketTableRow from './components/TicketTableRow';
import TicketTabs from './components/TicketTabs';
import { toTicketSearchRequest, useFilterState, useIsSidebarOpen } from './state';

const TicketTableComponents: TableComponents<Ticket> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <TicketTableRow item={item} {...props} />,
};

const formatDate = (unix?: number | null) => (unix ? getStringDateByUnixtimestamp(unix) : '');

const TicketTableRowContent: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const expired = isTicketExpired(ticket, ticket.status?.isOpen ?? true);
  const number = ticket.ticketNumber?.trim();

  return (
    <>
      <TableCell align="right" width={80}>
        <MainLabel>{ticket.ticketId}</MainLabel>
        <SecondaryLabel>{ticket.ticketYear}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 200 }}>
        <MainLabel title={ticket.customerName ?? undefined}>{ticket.customerName ?? '-'}</MainLabel>
        {number && number !== String(ticket.ticketId) ? <SecondaryLabel>N. {number}</SecondaryLabel> : null}
      </TableCell>
      <TableCell width={130}>
        <DelphiColorChip label={ticket.status?.name ?? String(ticket.statusId)} delphiColor={ticket.status?.color} />
      </TableCell>
      <TableCell width={110}>
        <MainLabel>{formatDate(ticket.ticketDate ?? ticket.createdDatetime) || '-'}</MainLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 160 }}>
        <SecondaryLabel title={ticket.systemDescription ?? undefined}>{ticket.systemDescription ?? '-'}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 220 }}>
        <SecondaryLabel title={ticket.description ?? undefined}>{ticket.description || '-'}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 150 }}>
        <MainLabel title={ticket.interventionType?.name}>{ticket.interventionType?.name ?? '-'}</MainLabel>
        <SecondaryLabel title={ticket.causal?.name}>{ticket.causal?.name}</SecondaryLabel>
      </TableCell>
      <TableCell width={100}>
        <Chip
          size="small"
          variant="outlined"
          color={getUrgencyColor(ticket.urgency)}
          label={getUrgencyLabel(ticket.urgency)}
        />
      </TableCell>
      <TableCell width={110}>
        <MainLabel sx={expired ? { color: 'error.main', fontWeight: 600 } : undefined}>
          {formatDate(ticket.expirationDate)}
        </MainLabel>
      </TableCell>
      <TableCell width={110}>
        <MainLabel>{formatDate(ticket.solutionDate)}</MainLabel>
      </TableCell>
      <TableCell align="center" width={90}>
        {ticket.printed ? (
          <Tooltip title="Stampato">
            <CheckCircleOutlined color="success" fontSize="small" />
          </Tooltip>
        ) : null}
      </TableCell>
    </>
  );
};

/** Tickets, like the Delphi "Gestione ticket" screen. A click on a row opens the summary aside. */
const TicketListView = () => {
  const filters = useFilterState();
  const isSidebarOpen = useIsSidebarOpen();
  const openStatusIds = useTicketOpenStatusIds();
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);

  const request = useMemo(() => toTicketSearchRequest(filters, openStatusIds), [filters, openStatusIds]);
  const queryParams = useMemo(() => (request ? { ...request, includes: TicketListIncludes } : undefined), [request]);
  const showPeriodicChecks = !!filters.periodicChecks;
  const ticketsQuery = useTicketsSearch(queryParams, { enabled: !!queryParams && !showPeriodicChecks });
  const tickets = ticketsQuery.data?.pages.flatMap((page) => page.list) ?? [];

  return (
    <SplitLayout>
      <SplitMain sidebarOpen={isSidebarOpen} ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <TicketTabs onRefresh={() => void ticketsQuery.refetch()} refreshing={ticketsQuery.isFetching} />

            {showPeriodicChecks ? <TicketPeriodicChecks /> : null}

            {ticketsQuery.isError ? <Alert severity="error">Non sono riuscito a caricare i ticket.</Alert> : null}

            {showPeriodicChecks ? null : (
              <>
                <ScrollToTopButton
                  onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
                  visible={!topReached}
                />

                <DataTableContainer>
                  <TableVirtuoso<Ticket>
                    ref={virtuoso}
                    atTopStateChange={setTopReached}
                    customScrollParent={scrollerRef.current || undefined}
                    data={tickets}
                    components={TicketTableComponents}
                    endReached={() => {
                      if (!ticketsQuery.hasNextPage || ticketsQuery.isFetching) return;
                      void ticketsQuery.fetchNextPage();
                    }}
                    fixedHeaderContent={() => (
                      <TicketTableHeading>
                        <TicketBar />
                      </TicketTableHeading>
                    )}
                    computeItemKey={(_index, ticket) => ticket.id}
                    itemContent={(_index, ticket) => <TicketTableRowContent ticket={ticket} />}
                  />
                </DataTableContainer>
              </>
            )}
          </Stack>
        </PageContainer>
        <TicketAside />
      </SplitMain>
    </SplitLayout>
  );
};

export default TicketListView;
