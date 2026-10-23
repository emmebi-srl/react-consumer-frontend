import { useMemo, useState } from 'react';
import { Stack } from '@mui/system';
import _isEmpty from 'lodash/isEmpty';
import useVirtuosoStateRestoration from '~/hooks/useVirtuosoStateRestoration';
import PageContainer from '~/components/Layout/PageContainer';
import DataTableContainer from '~/components/Table/DataTableContainer';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { Checklist } from '~/types/aries-proxy/checklists';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTable from '~/components/Table/DataTable';
import { useFilterState } from './state';
import ChecklistsTableHeading from './components/ChecklistsTableHeading';
import ChecklistsBar from './components/ChecklistsBar';
import { useChecklistsSearch } from '~/proxies/aries-proxy/checklists';
import ChecklistsListRowContent from './components/ChecklistsListRowContent';
import ChecklistTableRow from './components/ChecklistTableRow';

const ChecklistsTableComponents: TableComponents<Checklist> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ChecklistTableRow,
};

const ChecklistsListView = () => {
  const [topReached, setTopReached] = useState<boolean>(true);
  const filters = useFilterState();

  const checklistsQuery = useChecklistsSearch(filters.search);

  const checklists = useMemo(() => {
    const startingList = checklistsQuery.data?.list ?? [];
    if (_isEmpty(filters.search)) {
      return startingList;
    }

    const filteredList = startingList.filter((checklists) => {
      const searchLower = filters.search.toLowerCase();
      return (
        checklists.customer?.companyName.toLowerCase().includes(searchLower) ||
        checklists.customer?.taxCode.toLowerCase().includes(searchLower) ||
        checklists.customer?.vat.toLowerCase().includes(searchLower) ||
        checklists.system?.typeDescription.toLowerCase().includes(searchLower) ||
        checklists.system?.description.toLowerCase().includes(searchLower)
      );
    });

    return filteredList;
  }, [checklistsQuery.data, filters.search]);
  const {
    ref: virtuoso,
    restoreStateFrom,
    isScrolling,
  } = useVirtuosoStateRestoration(`checklists:${filters.search}`, checklists.length > 0);

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
          <TableVirtuoso<Checklist>
            ref={virtuoso}
            restoreStateFrom={restoreStateFrom}
            isScrolling={isScrolling}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            overscan={{
              main: 1000,
              reverse: 1000,
            }}
            components={ChecklistsTableComponents}
            data={checklists}
            fixedHeaderContent={() => (
              <ChecklistsTableHeading>
                <ChecklistsBar checklists={checklists} />
              </ChecklistsTableHeading>
            )}
            computeItemKey={(_index: number, checklist: Checklist) => checklist.id}
            itemContent={(_index: number, checklist: Checklist) => {
              return <ChecklistsListRowContent checklist={checklist} />;
            }}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};
export default ChecklistsListView;
