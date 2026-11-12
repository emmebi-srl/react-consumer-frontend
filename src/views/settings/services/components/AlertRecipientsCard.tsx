import { Add, Delete, Edit } from '@mui/icons-material';
import { Alert, Button, Card, CardHeader, IconButton, Stack, TableCell, Tooltip, Typography } from '@mui/material';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useMutateServiceAlertRecipient, useServiceAlertRecipients } from '~/proxies/aries-proxy/service-settings';
import { ServiceAlertConfig, ServiceAlertRecipient } from '~/types/aries-proxy/service-settings';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import RecipientEmailModal from './RecipientEmailModal';

const AlertRecipientsCard: React.FC<{ service: ServiceAlertConfig }> = ({ service }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const { data, isLoading, error } = useServiceAlertRecipients(service.id);
  const mutateRecipient = useMutateServiceAlertRecipient();
  const recipients = data?.recipients ?? [];

  const askEmail = async (title: string, email: string) => {
    const answer = await modal.showModal({ component: RecipientEmailModal, props: { title, email } });
    return answer.action === 'SAVE' && 'email' in answer ? String(answer.email) : null;
  };

  const run = async (mutation: Parameters<typeof mutateRecipient.mutateAsync>[0], successText: string) => {
    try {
      await mutateRecipient.mutateAsync(mutation);
      snackbar.success(successText);
    } catch (err) {
      snackbar.error(getApiErrorMessage(err, 'Operazione non riuscita.'));
    }
  };

  const add = async () => {
    const email = await askEmail('Nuovo destinatario', '');
    if (email) await run({ action: 'add', serviceId: service.id, email }, 'Destinatario aggiunto');
  };

  const edit = async (recipient: ServiceAlertRecipient) => {
    const email = await askEmail('Modifica destinatario', recipient.email);
    if (email && email !== recipient.email) {
      await run({ action: 'edit', serviceId: service.id, recipientId: recipient.id, email }, 'Destinatario salvato');
    }
  };

  const remove = async (recipient: ServiceAlertRecipient) => {
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Elimina destinatario', text: `Eliminare "${recipient.email}" dai destinatari?` },
    });
    if (answer.action === 'YES') {
      await run({ action: 'delete', serviceId: service.id, recipientId: recipient.id }, 'Destinatario eliminato');
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="Destinatari"
        subheader="Indirizzi a cui il servizio invia l'avviso"
        slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 700 } } }}
        action={
          <Button startIcon={<Add />} onClick={add} disabled={mutateRecipient.isPending}>
            Aggiungi
          </Button>
        }
      />
      {error ? <Alert severity="error">Non è stato possibile caricare i destinatari.</Alert> : null}
      <DataTableContainer>
        <DataTable size="small">
          <DataTableHead>
            <DataTableHeading
              order="asc"
              orderBy=""
              rowCount={recipients.length}
              headLabel={[{ label: 'Email' }, { label: 'Azioni', align: 'right' }]}
              numSelected={0}
              onRequestSort={() => {}}
              onSelectAllClick={() => {}}
              select={false}
              small
            />
          </DataTableHead>
          <DataTableBody>
            {recipients.map((recipient, index) => (
              <DataTableRow key={recipient.id} data-index={index} sx={{ cursor: 'default' }}>
                <TableCell>{recipient.email}</TableCell>
                <TableCell align="right" width={110}>
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Modifica">
                      <IconButton size="small" onClick={() => edit(recipient)} aria-label="Modifica">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Elimina">
                      <IconButton size="small" onClick={() => remove(recipient)} aria-label="Elimina">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </DataTableRow>
            ))}
            {!isLoading && recipients.length === 0 ? (
              <DataTableRow sx={{ cursor: 'default' }}>
                <TableCell colSpan={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nessun destinatario: il servizio non invierà avvisi.
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

export default AlertRecipientsCard;
