import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

const columns: ColumnConfig<'id'>[] = [
  { id: 'id', label: 'Rapporto', align: 'right' },
  { id: 'date', label: 'Data', align: 'left' },
  { id: 'customer', label: 'Cliente', align: 'left' },
  { id: 'system', label: 'Impianto', align: 'left' },
  { id: 'id', label: 'Relazione' },
  { id: 'status', label: 'Stato', align: 'left' },
  { id: 'total', label: 'Totale', align: 'right' },
];

const ReportTableHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DataTableHeading
    order="desc"
    orderBy="id"
    headLabel={columns}
    numSelected={0}
    rowCount={0}
    onRequestSort={() => {}}
    onSelectAllClick={() => {}}
    select={false}
  >
    {children}
  </DataTableHeading>
);

export default ReportTableHeading;
