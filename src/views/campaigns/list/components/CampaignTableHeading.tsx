import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';

interface Props {
  children: React.ReactNode | React.ReactElement;
  small?: boolean;
}

const CampaignTableHeading: React.FC<Props> = ({ children }) => {
  const head: ColumnConfig<'ID'>[] = [
    { id: 'id', label: 'ID', align: 'right' },
    { id: 'name', label: 'Nome', align: 'left' },
    { id: 'template', label: 'Template', align: 'left' },
    { id: 'type', label: 'Tipo', align: 'left' },
    { id: 'active', label: 'Attiva', align: 'center' },
    { id: 'activationDate', label: 'Data Attivazione', align: 'left' },
    { id: 'deactivationDate', label: 'Data Disattivazione', align: 'left' },
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

export default CampaignTableHeading;
