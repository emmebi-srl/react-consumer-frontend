import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
  small?: boolean;
}

const CustomerTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'ID'>[] = [
    { id: 'id', label: 'ID', align: 'right' },
    { id: 'companyName', label: 'Ragione Sociale', align: 'left' },
    { id: 'taxCode', label: 'Cod. Fiscale', align: 'left' },
    { id: 'vat', label: 'Partita IVA', align: 'left' },
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

export default CustomerTableHeading;
