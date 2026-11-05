import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
}

const DdtTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'id'>[] = [
    { id: 'id', label: 'Numero', align: 'right' },
    { id: 'status', label: 'Stato', align: 'left' },
    { id: 'date', label: 'Data', align: 'left' },
    { id: 'recipient', label: 'Intestatario', align: 'left' },
    { id: 'causal', label: 'Causale', align: 'left' },
    { id: 'destination', label: 'Destinazione', align: 'left' },
    { id: 'system', label: 'Impianto', align: 'left' },
    { id: 'note', label: 'Note', align: 'left' },
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

export default DdtTableHeading;
