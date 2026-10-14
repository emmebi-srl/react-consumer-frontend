import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
}

const ProductTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'productCode'>[] = [
    { id: 'productCode', label: 'Codice', align: 'left' },
    { id: 'description', label: 'Descrizione', align: 'left' },
    { id: 'supplierProductCode', label: 'Cod. Fornitore', align: 'left' },
    { id: 'brand', label: 'Marca', align: 'left' },
    { id: 'category', label: 'Categoria', align: 'left' },
    { id: 'subcategory', label: 'Sottocategoria', align: 'left' },
    { id: 'productionCostType', label: 'Tipo', align: 'left' },
    { id: 'measurementUnits', label: 'U.M.', align: 'left' },
    { id: 'isKit', label: 'Kit', align: 'center' },
    { id: 'status', label: 'Stato', align: 'left' },
  ];

  return (
    <DataTableHeading
      order="asc"
      orderBy="productCode"
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

export default ProductTableHeading;
