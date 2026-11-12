import { Card, CardHeader, TableCell, Typography } from '@mui/material';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import useSnackbar from '~/hooks/useSnackbar';
import { useCustomerReminderPlaceholders } from '~/proxies/aries-proxy/service-settings';

/** Variables usable in the email/SMS text of the reminder; a click copies the name. */
const ReminderPlaceholdersCard: React.FC<{ reminderId: number }> = ({ reminderId }) => {
  const snackbar = useSnackbar();
  const { data, isLoading } = useCustomerReminderPlaceholders(reminderId);
  const placeholders = data?.placeholders ?? [];

  const copy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      snackbar.success(`"${name}" copiato`);
    } catch {
      snackbar.error('Copia non riuscita');
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Variabili segnaposto"
        subheader="Clicca una variabile per copiarla nel testo"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
      />
      <DataTableContainer>
        <DataTable size="small">
          <DataTableHead>
            <DataTableHeading
              order="asc"
              orderBy=""
              rowCount={placeholders.length}
              headLabel={[{ label: 'Variabile' }, { label: 'Descrizione' }]}
              numSelected={0}
              onRequestSort={() => {}}
              onSelectAllClick={() => {}}
              select={false}
              small
            />
          </DataTableHead>
          <DataTableBody>
            {placeholders.map((placeholder, index) => (
              <DataTableRow key={placeholder.name} data-index={index} onClick={() => copy(placeholder.name)}>
                <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{placeholder.name}</TableCell>
                <TableCell>{placeholder.description}</TableCell>
              </DataTableRow>
            ))}
            {!isLoading && placeholders.length === 0 ? (
              <DataTableRow sx={{ cursor: 'default' }}>
                <TableCell colSpan={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nessuna variabile per questo promemoria.
                  </Typography>
                </TableCell>
              </DataTableRow>
            ) : null}
          </DataTableBody>
        </DataTable>
      </DataTableContainer>
    </Card>
  );
};

export default ReminderPlaceholdersCard;
