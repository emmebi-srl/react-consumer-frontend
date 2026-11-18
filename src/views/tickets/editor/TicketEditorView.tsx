import { useEffect, useMemo } from 'react';
import { LocalOffer } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import DetailPageHeader from '~/components/Layout/DetailPageHeader';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useCreateTicket, useSaveTicket, useTicketById } from '~/proxies/aries-proxy/tickets';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import TicketActions from '../components/TicketActions';
import TicketAttachmentsList from '../components/TicketAttachmentsList';
import TicketDocumentsList from '../components/TicketDocumentsList';
import TicketEventsList from '../components/TicketEventsList';
import TicketSystemConditions from '../components/TicketSystemConditions';
import TicketTagsModal from '../components/TicketTagsModal';
import { formatTicketTitle, getUrgencyColor, getUrgencyLabel } from '../ticketHelpers';
import TicketCustomerCard from './components/TicketCustomerCard';
import TicketFieldsCard from './components/TicketFieldsCard';
import { fromTicket, getMissingField, newTicketValues, TicketFormValues, toSaveRequest } from './ticketFormValues';

/**
 * Create and edit a ticket, like the Delphi TFTickets form (Inserisci / Modifica). Status, sending and "stampato" are
 * changed with the header actions, as from the Delphi list menu.
 */
const TicketEditorView = () => {
  const params = useParams<{ ticketId: string }>();
  const id = params.ticketId ? Number(params.ticketId) : undefined;
  const isNew = !id;
  const navigate = useNavigate();
  const modal = useModal();
  const snackbar = useSnackbar();
  const { permission } = useModulePermission(AriesModule.Tickets);
  const ticketQuery = useTicketById(id);
  const createMutation = useCreateTicket();
  const saveMutation = useSaveTicket();
  const ticket = ticketQuery.data;

  const form = useForm<TicketFormValues>({ defaultValues: newTicketValues() });
  const initialValues = useMemo(() => {
    if (isNew) return newTicketValues();
    return ticket ? fromTicket(ticket) : null;
  }, [isNew, ticket]);

  useEffect(() => {
    if (initialValues) form.reset(initialValues);
  }, [initialValues, form]);

  const ready = isNew || !!ticket;
  const saving = createMutation.isPending || saveMutation.isPending;
  const canSave = isNew ? !!permission?.canInsert : !!permission?.canEdit;

  const submit = form.handleSubmit(async (values) => {
    const missing = getMissingField(values);
    if (missing) {
      snackbar.error(missing);
      return;
    }
    // Same question as Delphi BtnAddClick / BtnEditClick.
    if (!values.description.trim()) {
      const answer = await modal.showModal({
        component: ConfirmationModal,
        props: { title: 'Descrizione vuota', text: 'La descrizione del problema è vuota. Continuare?' },
      });
      if (answer.action !== 'YES') return;
    }

    const request = toSaveRequest(values);
    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(request);
        snackbar.success(created ? `Ticket ${created.ticketId}/${created.ticketYear} inserito` : 'Ticket inserito');
        if (created) navigate(RouteConfig.TicketDetail.buildLink({ ticketId: String(created.id) }), { replace: true });
      } else {
        await saveMutation.mutateAsync({ id, data: request });
        snackbar.success('Ticket salvato');
      }
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare il ticket.'));
    }
  });

  if (!isNew && ticketQuery.isSuccess && !ticket) {
    return (
      <PageContainer>
        <Alert severity="warning">Ticket non trovato.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormProvider {...form}>
        <Stack component="form" spacing={2.5} onSubmit={submit} sx={{ pb: 10 }}>
          <DetailPageHeader
            backTo={RouteConfig.TicketList.buildLink()}
            title={isNew ? 'Nuovo ticket' : ticket ? formatTicketTitle(ticket) : 'Ticket'}
            badges={
              ticket ? (
                <>
                  <DelphiColorChip
                    label={ticket.status?.name ?? String(ticket.statusId)}
                    delphiColor={ticket.status?.color}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    color={getUrgencyColor(ticket.urgency)}
                    label={`Urgenza ${getUrgencyLabel(ticket.urgency).toLowerCase()}`}
                  />
                  {ticket.printed ? <Chip size="small" color="success" variant="outlined" label="Stampato" /> : null}
                </>
              ) : null
            }
            actions={
              ticket ? (
                <TicketActions
                  ticket={ticket}
                  onDeleted={() => navigate(RouteConfig.TicketList.buildLink(), { replace: true })}
                />
              ) : null
            }
          />

          {ticketQuery.isError ? <Alert severity="error">Non sono riuscito a caricare il ticket.</Alert> : null}

          {!ready ? (
            <Stack sx={{ alignItems: 'center', py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                alignItems: 'start',
                gridTemplateColumns: { xs: '1fr', lg: isNew ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)' },
              }}
            >
              <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                <TicketCustomerCard disabled={!canSave} />
                <TicketFieldsCard disabled={!canSave} isNew={isNew} />
              </Stack>
              {ticket ? (
                <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                  {ticket.systemConditions ? (
                    <Card variant="outlined">
                      <CardHeader title="Abbonamento impianto" titleTypographyProps={{ variant: 'subtitle1' }} />
                      <CardContent>
                        <TicketSystemConditions conditions={ticket.systemConditions} />
                      </CardContent>
                    </Card>
                  ) : null}
                  <Card variant="outlined">
                    <CardHeader
                      title="Tag"
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      action={
                        permission?.canEdit ? (
                          <Button
                            size="small"
                            startIcon={<LocalOffer />}
                            onClick={() => void modal.showModal({ component: TicketTagsModal, props: { ticket } })}
                          >
                            Gestisci
                          </Button>
                        ) : null
                      }
                    />
                    <CardContent>
                      {ticket.tags?.length ? (
                        <Stack direction="row" useFlexGap sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                          {ticket.tags.map((tag) => (
                            <Chip key={tag.id} size="small" label={tag.name} />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Nessun tag
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardHeader title="Calendario e tecnici" titleTypographyProps={{ variant: 'subtitle1' }} />
                    <CardContent>
                      <TicketEventsList events={ticket.events ?? []} />
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardHeader title="Documenti" titleTypographyProps={{ variant: 'subtitle1' }} />
                    <CardContent>
                      <TicketDocumentsList documents={ticket.documents ?? []} />
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardHeader title="Allegato" titleTypographyProps={{ variant: 'subtitle1' }} />
                    <CardContent>
                      <TicketAttachmentsList
                        ticketId={ticket.id}
                        attachments={ticket.attachments ?? []}
                        canUpload={!!permission?.canEdit}
                      />
                    </CardContent>
                  </Card>
                  <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                    Inserito il {getStringDateTimeByUnixtimestamp(ticket.createdDatetime)}
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          )}

          {ready && canSave && (isNew || form.formState.isDirty) ? (
            <FormSaveBar
              saving={saving}
              cancelLabel={isNew ? 'Annulla' : 'Annulla modifiche'}
              submitLabel={isNew ? 'Inserisci ticket' : 'Salva ticket'}
              onCancel={() =>
                isNew ? navigate(RouteConfig.TicketList.buildLink()) : initialValues && form.reset(initialValues)
              }
            />
          ) : null}
        </Stack>
      </FormProvider>
    </PageContainer>
  );
};

export default TicketEditorView;
