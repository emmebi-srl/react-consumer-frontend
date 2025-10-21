import { useMemo, useRef, useState } from 'react';
import { Stack } from '@mui/system';
import _isEmpty from 'lodash/isEmpty';
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

  const customersQuery = useCustomersSearch(filters.search);
  const virtuoso = useRef<TableVirtuosoHandle>(null);

  const customers = useMemo(() => {
    const startingList = customersQuery.data ?? [];
    if (_isEmpty(filters.search)) {
      return startingList;
    }

    const filteredList = startingList.filter((customer) => {
      const searchLower = filters.search.toLowerCase();
      return (
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.taxCode.toLowerCase().includes(searchLower) ||
        customer.vat.toLowerCase().includes(searchLower)
      );
    });

    return filteredList;
  }, [customersQuery.data, filters.search]);

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
            fixedHeaderContent={() => (
              <CustomerTableHeading>
                <CustomerBar customers={customers} />
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
