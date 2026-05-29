import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
}

const SupplierInvoiceTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'id'>[] = [
    { id: 'id', label: 'Protocollo', align: 'right' },
    { id: 'date', label: 'Data', align: 'left' },
    { id: 'supplier', label: 'Fornitore', align: 'left' },
    { id: 'status', label: 'Stato', align: 'left' },
    { id: 'type', label: 'Tipo', align: 'left' },
    { id: 'causal', label: 'Causale', align: 'left' },
    { id: 'products', label: 'Prodotti', align: 'center' },
    { id: 'amount', label: 'Totale', align: 'right' },
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

export default SupplierInvoiceTableHeading;
