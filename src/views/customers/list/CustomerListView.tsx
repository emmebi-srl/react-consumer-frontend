import { useMemo, useState } from 'react';
import { Stack } from '@mui/system';
import useVirtuosoStateRestoration from '~/hooks/useVirtuosoStateRestoration';
import PageContainer from '~/components/Layout/PageContainer';
import { useCustomersSearch } from '~/proxies/aries-proxy/customers';
import DataTableContainer from '~/components/Table/DataTableContainer';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { Customer } from '~/types/aries-proxy/customers';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTable from '~/components/Table/DataTable';
import { useFilterState } from './state';
import CustomerTableRowContent from './components/CustomerTableRowContent';
import CustomerTableHeading from './components/CustomerTableHeading';
import CustomerBar from './components/CustomerBar';
import CustomerTableRow from './components/CustomerTableRow';
import CustomerTabs from './components/CustomerTabs';

const CustomersTableComponents: TableComponents<Customer> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <CustomerTableRow entity={item} {...props} />,
};

const CustomerListView = () => {
  const [topReached, setTopReached] = useState<boolean>(true);
  const filters = useFilterState();

  const queryParams = useMemo(
    () => ({
      search: filters.search,
      statusId: filters.statusId,
      customerTypeId: filters.customerTypeId,
      includes: 'destinations,status',
    }),
    [filters.search, filters.statusId, filters.customerTypeId],
  );

  const customersQuery = useCustomersSearch(queryParams);
  const customers = customersQuery.data?.pages.flatMap((page) => page.customers) ?? [];
  const {
    ref: virtuoso,
    restoreStateFrom,
    isScrolling,
  } = useVirtuosoStateRestoration(`customers:${JSON.stringify(queryParams)}`, customers.length > 0);

  return (
    <PageContainer>
      <Stack
        spacing={3}
        direction="column"
        sx={{
          flexGrow: 1,
          // Without this the flex item grows to the full list height and the page scrolls instead of the table.
          minHeight: 0,
        }}
      >
        <CustomerTabs />
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
        <DataTableContainer sx={{ minHeight: 0 }}>
          <TableVirtuoso<Customer>
            ref={virtuoso}
            restoreStateFrom={restoreStateFrom}
            isScrolling={isScrolling}
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
