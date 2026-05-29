import { useMemo, useRef, useState } from 'react';
import { Button, Chip, Stack, TableCell, Typography } from '@mui/material';
import { EventRepeat, Refresh } from '@mui/icons-material';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTable from '~/components/Table/DataTable';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableRow from '~/components/Table/DataTableRow';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import SplitLayout from '~/components/Layout/SplitLayout';
import SplitMain from '~/components/Layout/SplitMain';
import { useSupplierInvoicesSearch } from '~/proxies/aries-proxy/supplier-invoices';
import { SupplierInvoice } from '~/types/aries-proxy/supplier-invoices';
import { formatMoney } from '~/utils/money';
import SupplierInvoiceBar from './components/SupplierInvoiceBar';
import SupplierInvoiceTableHeading from './components/SupplierInvoiceTableHeading';
import { useFilterState } from './state';
import { RouteConfig } from '~/routes/routeConfig';

const SupplierInvoiceTableComponents: TableComponents<SupplierInvoice> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('it-IT').format(new Date(value));
};

const formatCurrency = (value: number) => formatMoney({ amount: value.toString(), currency: 'EUR' });

const SupplierInvoiceTableRowContent: React.FC<{ invoice: SupplierInvoice }> = ({ invoice }) => {
  const productCount = invoice.products?.length ?? 0;

  return (
    <>
      <TableCell align="right">
        <MainLabel>{invoice.id}</MainLabel>
        <SecondaryLabel>{invoice.year}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <MainLabel>{formatDate(invoice.invoiceDate)}</MainLabel>
        <SecondaryLabel>{invoice.supplierInvoiceCode || '-'}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <MainLabel>{invoice.supplier?.companyName ?? `#${invoice.supplierId}`}</MainLabel>
        <SecondaryLabel>{invoice.supplier?.vatNumber ?? invoice.supplier?.supplierCode ?? '-'}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <Chip size="small" label={invoice.status?.name ?? invoice.statusId} />
      </TableCell>
      <TableCell>
        <SecondaryLabel>{invoice.type?.name ?? invoice.typeId}</SecondaryLabel>
      </TableCell>
      <TableCell>
        <SecondaryLabel>{invoice.causal?.name ?? invoice.causalId}</SecondaryLabel>
      </TableCell>
      <TableCell align="center">
        <Chip size="small" label={productCount} />
      </TableCell>
      <TableCell align="right">
        <MainLabel>{formatCurrency(invoice.totalAmount)}</MainLabel>
        <SecondaryLabel>{invoice.paymentCondition?.name ?? '-'}</SecondaryLabel>
      </TableCell>
    </>
  );
};

const SupplierInvoiceListView = () => {
  const filters = useFilterState();
  const virtuoso = useRef<TableVirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [topReached, setTopReached] = useState(true);

  const queryParams = useMemo(
    () => ({
      search: filters.search,
      year: filters.year,
      statusId: filters.statusId,
      typeId: filters.typeId,
      causalId: filters.causalId,
      includes: 'supplier,status,type,causal,products,payment_condition,activity',
    }),
    [filters.causalId, filters.search, filters.statusId, filters.typeId, filters.year],
  );

  const invoicesQuery = useSupplierInvoicesSearch(queryParams);
  const invoices = invoicesQuery.data?.pages.flatMap((page) => page.supplierInvoices) ?? [];

  return (
    <SplitLayout>
      <SplitMain ref={scrollerRef}>
        <PageContainer>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4">Fatture Fornitore</Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => invoicesQuery.refetch()}
                disabled={invoicesQuery.isFetching}
              >
                Aggiorna
              </Button>
              <Button
                variant="contained"
                startIcon={<EventRepeat />}
                component={RouterLink}
                to={RouteConfig.SupplierInvoicePeriodicConfigurationList.buildLink()}
                sx={{ marginLeft: 'auto !important' }}
              >
                Gestisci periodicità
              </Button>
            </Stack>

            <ScrollToTopButton
              onClick={() =>
                virtuoso.current?.scrollToIndex({
                  index: 0,
                  align: 'start',
                  behavior: 'smooth',
                })
              }
              visible={!topReached}
            />

            <DataTableContainer>
              <TableVirtuoso<SupplierInvoice>
                ref={virtuoso}
                atTopStateChange={setTopReached}
                customScrollParent={scrollerRef.current || undefined}
                data={invoices}
                components={SupplierInvoiceTableComponents}
                endReached={() => {
                  if (!invoicesQuery.hasNextPage || invoicesQuery.isFetching) return;
                  invoicesQuery.fetchNextPage();
                }}
                fixedHeaderContent={() => (
                  <SupplierInvoiceTableHeading>
                    <SupplierInvoiceBar />
                  </SupplierInvoiceTableHeading>
                )}
                computeItemKey={(_index, invoice) => `${invoice.year}-${invoice.id}`}
                itemContent={(_index, invoice) => <SupplierInvoiceTableRowContent invoice={invoice} />}
              />
            </DataTableContainer>
          </Stack>
        </PageContainer>
      </SplitMain>
    </SplitLayout>
  );
};

export default SupplierInvoiceListView;
