import { useMemo, useRef, useState } from 'react';
import { Alert, Stack, TableCell, Tooltip } from '@mui/material';
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
import { useInvoicesSearch } from '~/proxies/aries-proxy/invoices';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { INVOICE_SENT_TYPES, Invoice } from '~/types/aries-proxy/invoices';
import { AriesModule } from '~/types/aries-proxy/users';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';
import InvoiceAside from './components/InvoiceAside';
import InvoiceBar from './components/InvoiceBar';
import InvoiceTableHeading from './components/InvoiceTableHeading';
import InvoiceTableRow from './components/InvoiceTableRow';
import InvoiceTabs from './components/InvoiceTabs';
import InvoiceTotalsCards from './components/InvoiceTotalsCards';
import { toInvoiceSearchRequest, useFilterState, useIsSidebarOpen } from './state';

const InvoiceTableComponents: TableComponents<Invoice> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <InvoiceTableRow item={item} {...props} />,
};

const ListIncludes = 'customer,status,type,payment_condition';

const InvoiceTableRowContent: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const sentLabel = INVOICE_SENT_TYPES.find((type) => type.id === invoice.sentType)?.label;
  return (
    <>
      <TableCell align="right" width={90}>
        <MainLabel>{invoice.id}</MainLabel>
        <SecondaryLabel>{invoice.year === 0 ? 'Prefatt.' : invoice.year}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 220 }}>
        <MainLabel title={invoice.customerName ?? undefined}>{invoice.customerName ?? '-'}</MainLabel>
        {invoice.isCustomerInsolvent ? <SecondaryLabel sx={{ color: 'error.main' }}>Insolvente</SecondaryLabel> : null}
      </TableCell>
      <TableCell width={110}>
        <MainLabel>{getStringDateByUnixtimestamp(invoice.invoiceDate) || '-'}</MainLabel>
      </TableCell>
      <TableCell width={170}>
        <DelphiColorChip label={invoice.status?.name ?? String(invoice.statusId)} delphiColor={invoice.status?.color} />
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 140 }}>
        <SecondaryLabel title={invoice.type?.name}>{invoice.type?.name ?? '-'}</SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 150 }}>
        <SecondaryLabel title={invoice.paymentCondition?.name ?? undefined}>
          {invoice.paymentCondition?.name ?? '-'}
        </SecondaryLabel>
      </TableCell>
      <TableCell sx={{ maxWidth: 0, minWidth: 160 }}>
        <SecondaryLabel title={invoice.internalNote ?? undefined}>{invoice.internalNote || '-'}</SecondaryLabel>
      </TableCell>
      <TableCell align="right" width={120}>
        <MainLabel>{formatMoney(newMoney(invoice.totalAmount, 'EUR'))}</MainLabel>
      </TableCell>
      <TableCell align="center" width={80}>
        {invoice.sentType ? (
          <Tooltip title={`Inviata: ${sentLabel ?? invoice.sentType}`}>
            <CheckCircleOutlined color="success" fontSize="small" />
          </Tooltip>
        ) : null}
      </TableCell>
    </>
  );
};

/** Issued invoices and preinvoices, like the Delphi "Fatture" screen. A click on a row opens the summary aside. */
const InvoiceListView = () => {
  const filters = useFilterState();
  const isSidebarOpen = useIsSidebarOpen();
  const { permission } = useModulePermission(AriesModule.Invoices);
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);

  const queryParams = useMemo(() => ({ ...toInvoiceSearchRequest(filters), includes: ListIncludes }), [filters]);
  const invoicesQuery = useInvoicesSearch(queryParams);
  const invoices = invoicesQuery.data?.pages.flatMap((page) => page.invoices) ?? [];

  return (
    <SplitLayout>
      <SplitMain sidebarOpen={isSidebarOpen} ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <InvoiceTabs onRefresh={() => invoicesQuery.refetch()} refreshing={invoicesQuery.isFetching} />

            {permission?.canTotals ? <InvoiceTotalsCards /> : null}

            {invoicesQuery.isError ? <Alert severity="error">Non sono riuscito a caricare le fatture.</Alert> : null}

            <ScrollToTopButton
              onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
              visible={!topReached}
            />

            <DataTableContainer>
              <TableVirtuoso<Invoice>
                ref={virtuoso}
                atTopStateChange={setTopReached}
                customScrollParent={scrollerRef.current || undefined}
                data={invoices}
                components={InvoiceTableComponents}
                endReached={() => {
                  if (!invoicesQuery.hasNextPage || invoicesQuery.isFetching) return;
                  invoicesQuery.fetchNextPage();
                }}
                fixedHeaderContent={() => (
                  <InvoiceTableHeading>
                    <InvoiceBar />
                  </InvoiceTableHeading>
                )}
                computeItemKey={(_index, invoice) => `${invoice.year}-${invoice.id}`}
                itemContent={(_index, invoice) => <InvoiceTableRowContent invoice={invoice} />}
              />
            </DataTableContainer>
          </Stack>
        </PageContainer>
        <InvoiceAside />
      </SplitMain>
    </SplitLayout>
  );
};

export default InvoiceListView;
