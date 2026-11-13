import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

const UsersTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const head: ColumnConfig<'username'>[] = [
    { id: 'id', label: 'ID', align: 'right' },
    { id: 'username', label: 'Utente', align: 'left' },
    { id: 'userType', label: 'Tipologia', align: 'left' },
    { id: 'roles', label: 'Ruoli', align: 'left' },
    { id: 'email', label: 'Email', align: 'left' },
    { id: 'passkeys', label: 'Passkey', align: 'right' },
  ];

  return (
    <DataTableHeading
      order="asc"
      orderBy="username"
      headLabel={head}
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

export default UsersTableHeading;
