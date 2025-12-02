import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
}

const QuoteTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'id'>[] = [
    { id: 'id', label: 'ID', align: 'right' },
    { id: 'note', label: 'Note', align: 'left' },
    { id: 'state', label: 'Stato', align: 'left' },
    { id: 'type', label: 'Tipo', align: 'left' },
    { id: 'customer', label: 'Cliente', align: 'left' },
    { id: 'destination', label: 'Destinazione', align: 'left' },
    { id: 'revisions', label: 'Revisioni', align: 'center' },
    { id: 'actions', label: 'Azioni', align: 'right' },
  ];

  return (
    <DataTableHeading
      order="asc"
      orderBy="id"
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

export default QuoteTableHeading;
