import { Alert, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import PageContainer from '~/components/Layout/PageContainer';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import ScrollToTopButton from '~/components/Table/ScrollToTopButton';
import useVirtuosoStateRestoration from '~/hooks/useVirtuosoStateRestoration';
import { useUserAccounts, useUserRoles } from '~/proxies/aries-proxy/user-accounts';
import { UserAccount } from '~/types/aries-proxy/users';
import UserListRowContent from './components/UserListRowContent';
import UsersBar from './components/UsersBar';
import UsersTableHeading from './components/UsersTableHeading';
import UserTableRow from './components/UserTableRow';
import UserTabs from './components/UserTabs';
import { useFilterState } from './state';

const UsersTableComponents: TableComponents<UserAccount> = {
  Table: DataTable,
  TableHead: DataTableHead,
  TableBody: DataTableBody,
  TableRow: ({ item, ...props }) => <UserTableRow entity={item} {...props} />,
};

/** Users of Aries (Delphi TFSettingsUsers in admin mode). Few rows: loaded whole and filtered here. */
const UserListView: React.FC = () => {
  const [topReached, setTopReached] = useState<boolean>(true);
  const filters = useFilterState();
  const usersQuery = useUserAccounts();
  const { data: roles = [] } = useUserRoles();

  const users = useMemo(() => {
    const all = usersQuery.data ?? [];
    const search = filters.search.trim().toLowerCase();
    if (!search) return all;
    return all.filter((user) =>
      [user.username, user.description, user.email, user.userType].some((value) =>
        value?.toLowerCase().includes(search),
      ),
    );
  }, [usersQuery.data, filters.search]);

  const {
    ref: virtuoso,
    restoreStateFrom,
    isScrolling,
  } = useVirtuosoStateRestoration(`users:${filters.search}`, users.length > 0);

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
        <UserTabs />
        {usersQuery.isError ? <Alert severity="error">Non è stato possibile caricare gli utenti.</Alert> : null}
        <ScrollToTopButton
          onClick={() => virtuoso.current?.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' })}
          visible={!topReached}
        />
        <DataTableContainer sx={{ minHeight: 0 }}>
          <TableVirtuoso<UserAccount>
            ref={virtuoso}
            restoreStateFrom={restoreStateFrom}
            isScrolling={isScrolling}
            atTopStateChange={setTopReached}
            atTopThreshold={100}
            components={UsersTableComponents}
            data={users}
            fixedHeaderContent={() => (
              <UsersTableHeading>
                <UsersBar filteredCount={users.length} totalCount={usersQuery.data?.length ?? 0} />
              </UsersTableHeading>
            )}
            computeItemKey={(_index: number, user: UserAccount) => user.id}
            itemContent={(_index: number, user: UserAccount) => <UserListRowContent user={user} roles={roles} />}
          />
        </DataTableContainer>
      </Stack>
    </PageContainer>
  );
};

export default UserListView;
