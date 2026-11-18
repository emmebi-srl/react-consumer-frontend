import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
}

const TicketTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'id'>[] = [
    { id: 'id', label: 'N.', align: 'right' },
    { id: 'customer', label: 'Cliente', align: 'left' },
    { id: 'status', label: 'Stato', align: 'left' },
    { id: 'date', label: 'Data', align: 'left' },
    { id: 'system', label: 'Impianto', align: 'left' },
    { id: 'description', label: 'Descrizione', align: 'left' },
    { id: 'intervention', label: 'Intervento', align: 'left' },
    { id: 'urgency', label: 'Urgenza', align: 'left' },
    { id: 'expiration', label: 'Scadenza', align: 'left' },
    { id: 'solution', label: 'Soluzione', align: 'left' },
    { id: 'printed', label: 'Stampato', align: 'center' },
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

export default TicketTableHeading;
