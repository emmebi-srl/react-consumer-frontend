import { useMemo, useRef, useState } from 'react';
import { Stack } from '@mui/system';
import PageContainer from '~/components/Layout/PageContainer';
import { useCustomersSearch } from '~/proxies/aries-proxy/customers';
import DataTableContainer from '~/components/Table/DataTableContainer';
import { TableComponents, TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso';
import { Customer } from '~/types/aries-proxy/customers';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import DataTableRow from '~/components/Table/DataTableRow';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTable from '~/components/Table/DataTable';
import { useFilterState } from './state';
import CustomerTableRowContent from './components/CustomerTableRowContent';
import CustomerTableHeading from './components/CustomerTableHeading';
import CustomerBar from './components/CustomerBar';

const CustomersTableComponents: TableComponents<Customer> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: DataTableRow,
};

const CustomerListView = () => {
  const [topReached, setTopReached] = useState<boolean>(true);
  const filters = useFilterState();
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const queryParams = useMemo(
    () => ({
      search: filters.search,
      statusId: filters.statusId,
      customerTypeId: filters.customerTypeId,
    }),
    [filters.search, filters.statusId, filters.customerTypeId],
  );

  const customersQuery = useCustomersSearch(queryParams);
  const customers = customersQuery.data?.pages.flatMap((page) => page.customers) ?? [];

  return (
    <PageContainer>
      <Stack
        spacing={3}
        direction="column"
        sx={{
          flexGrow: 1,
        }}
      >
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
          <TableVirtuoso<Customer>
            ref={virtuoso}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{
              main: 1000,
              reverse: 1000,
            }}
            components={CustomersTableComponents}
            data={customers}
            endReached={() => {
              if (!customersQuery.hasNextPage || customersQuery.isFetching) return;
              customersQuery.fetchNextPage();
            }}
            fixedHeaderContent={() => (
              <CustomerTableHeading>
                <CustomerBar />
              </CustomerTableHeading>
            )}
            computeItemKey={(_index: number, customer: Customer) => customer.id}
            itemContent={(_index: number, customer: Customer) => {
              return <CustomerTableRowContent customer={customer} />;
            }}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};
export default CustomerListView;
