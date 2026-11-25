import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
}

const InvoiceTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'id'>[] = [
    { id: 'id', label: 'Numero', align: 'right' },
    { id: 'customer', label: 'Cliente', align: 'left' },
    { id: 'date', label: 'Data', align: 'left' },
    { id: 'status', label: 'Stato', align: 'left' },
    { id: 'type', label: 'Tipo', align: 'left' },
    { id: 'payment', label: 'Pagamento', align: 'left' },
    { id: 'note', label: 'Descrizione', align: 'left' },
    { id: 'total', label: 'Totale', align: 'right' },
    { id: 'sent', label: 'Invio', align: 'center' },
  ];

  return (
    <DataTableHeading
      order="desc"
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

export default InvoiceTableHeading;
