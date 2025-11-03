import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
  small?: boolean;
}

const ChecklistsTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'ID'>[] = [
    { id: 'id', label: 'ID', align: 'right' },
    { id: 'date', label: 'Data', align: 'left' },
    { id: 'companyName', label: 'Ragione Sociale', align: 'left' },
    { id: 'systemDescription', label: 'Impianto', align: 'left' },
    { id: 'systemType', label: 'Tipo Impianto', align: 'left' },
  ];

  return (
    <DataTableHeading
      order="asc"
      orderBy="ID"
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

export default ChecklistsTableHeading;
