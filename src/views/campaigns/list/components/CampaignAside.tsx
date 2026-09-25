import SplitAside from '~/components/Layout/SplitAside';
import z from 'zod';
import { useActiveId, useIsSidebarOpen, useResetSelection } from '../state';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import {
  useCampaignById,
  useCampaignTypes,
  useUpdateCampaign,
  useDeleteCampaign,
} from '~/proxies/aries-proxy/campaigns';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { useFilesExplorerDownloadFile } from '~/proxies/aries-proxy/files-explorer';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { sanitize } from 'lettersanitizer';
import { Campaign } from '~/types/aries-proxy/campaigns';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Delete, ToggleOff, ToggleOn } from '@mui/icons-material';
import { resolveError } from '~/hooks/useExceptionLogger';
import { Link as RouterLink } from 'react-router-dom';
import { RouteConfig } from '~/routes/routeConfig';

const EditCampaignFormSchema = z.object({
  replyToAddress: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email('Indirizzo email non valido').or(z.literal(''))),
  name: z.string().min(1, { message: 'Nome è obbligatorio' }),
  description: z.string().min(1, { message: 'Descrizione è obbligatoria' }),
  mailSubject: z.string().min(1, { message: 'Oggetto email è obbligatorio' }),
  campaignTypeId: z
    .number({
      message: 'Tipo campagna obbligatorio',
    })
    .int()
    .positive(),
});

type EditCampaignFormValues = z.infer<typeof EditCampaignFormSchema>;

const CampaignAsideForm: React.FC<{
  campaign: Campaign;
}> = ({ campaign }) => {
  const { data: campaignTypesData, isLoading: areCampaignTypesLoading } = useCampaignTypes();
  const campaignTemplate = useFilesExplorerDownloadFile(campaign.mailTemplatePath);
  const campaignUpdate = useUpdateCampaign();

  const form = useForm<EditCampaignFormValues>({
    resolver: zodResolver(EditCampaignFormSchema),
    values: {
      campaignTypeId: campaign.campaignTypeId,
      name: campaign.name,
      description: campaign.description,
      mailSubject: campaign.mailSubject,
      replyToAddress: campaign.replyToAddress ?? '',
    },
    resetOptions: { keepDirtyValues: true },
  });

  const handleSubmit = (data: EditCampaignFormValues) => {
    campaignUpdate.mutate(
      {
        id: campaign.id,
        data: {
          campaignTypeId: data.campaignTypeId,
          name: data.name,
          description: data.description,
          mailSubject: data.mailSubject,
          replyToAddress: data.replyToAddress,
        },
      },
      {
        onSuccess: () => {
          form.reset(data);
        },
      },
    );
  };

  const campaignTypes = campaignTypesData?.campaignTypes ?? [];
  const resolvedError = campaignUpdate.error ? resolveError(campaignUpdate.error) : null;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <Stack gap={3} direction="column">
        <Controller
          control={form.control}
          name="campaignTypeId"
          render={({ field }) => (
            <TextField
              {...field}
              label="Tipo campagna"
              select
              fullWidth
              value={field.value || ''}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(value === '' ? undefined : Number(value));
              }}
              disabled={areCampaignTypesLoading}
              error={!!form.formState.errors.campaignTypeId}
              helperText={form.formState.errors.campaignTypeId?.message}
            >
              <MenuItem value="" disabled>
                Seleziona un tipo di campagna
              </MenuItem>
              {campaignTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          {...form.register('name')}
          label="Nome"
          fullWidth
          error={!!form.formState.errors.name}
          helperText={form.formState.errors.name?.message}
        />
        <TextField
          {...form.register('description')}
          label="Descrizione"
          fullWidth
          multiline
          minRows={3}
          error={!!form.formState.errors.description}
          helperText={form.formState.errors.description?.message}
        />
        <Stack direction="column" gap={2}>
          <Typography variant="subtitle1" gutterBottom>
            Template email
          </Typography>
          <TextField
            {...form.register('mailSubject')}
            label="Oggetto email"
            fullWidth
            error={!!form.formState.errors.mailSubject}
            helperText={form.formState.errors.mailSubject?.message}
          />
          <TextField
            {...form.register('replyToAddress')}
            label="Rispondi a"
            type="email"
            fullWidth
            error={!!form.formState.errors.replyToAddress}
            helperText={
              form.formState.errors.replyToAddress?.message ??
              "Facoltativo. Se vuoto, usa l'indirizzo di risposta dell'account email."
            }
          />
          <Box
            sx={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {campaignTemplate.isLoading ? (
              <Stack justifyContent="center">
                <CircularProgress />
              </Stack>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitize(campaignTemplate.data ?? ''),
                }}
              ></div>
            )}
          </Box>
        </Stack>
        {resolvedError && (
          <Alert severity="error">
            <AlertTitle>{resolvedError.title}</AlertTitle>
            {resolvedError.message}
          </Alert>
        )}
        <Stack direction="row" gap={2} alignItems="center" justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() =>
              form.reset({
                name: campaign.name,
                description: campaign.description,
                mailSubject: campaign.mailSubject,
                replyToAddress: campaign.replyToAddress ?? '',
                campaignTypeId: campaign.campaignTypeId,
              })
            }
            disabled={campaignUpdate.isPending}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={campaignUpdate.isPending}
            disabled={!form.formState.isDirty}
          >
            Salva
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

const CampaignActions: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const campaignUpdate = useUpdateCampaign();
  const campaignDelete = useDeleteCampaign();
  const resetSelection = useResetSelection();
  const isPending = campaignUpdate.isPending || campaignDelete.isPending;

  const handleToggleActive = (value: boolean) => {
    campaignUpdate.mutate({
      id: campaign.id,
      data: {
        active: value,
      },
    });
  };

  const error = campaignDelete.error ?? campaignUpdate.error;
  const resolvedError = error ? resolveError(error) : null;
  return (
    <Stack gap={2} direction="column">
      {resolvedError && (
        <Alert severity="error">
          <AlertTitle>{resolvedError.title}</AlertTitle>
          {resolvedError.message}
        </Alert>
      )}
      <Stack gap={2} direction="row" justifyContent="center">
        <Button
          component={RouterLink}
          to={RouteConfig.CampaignDetail.buildLink({ campaignId: String(campaign.id) })}
          variant="contained"
        >
          Vedi dettagli
        </Button>
        {campaign.active ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ToggleOff />}
            onClick={() => handleToggleActive(false)}
            disabled={isPending}
          >
            Disattiva
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ToggleOn />}
            onClick={() => handleToggleActive(true)}
            disabled={isPending}
          >
            Attiva
          </Button>
        )}
        <Button
          variant="text"
          color="error"
          startIcon={<Delete />}
          loading={campaignDelete.isPending}
          disabled={isPending}
          onClick={() => campaignDelete.mutate(campaign.id, { onSuccess: resetSelection })}
        >
          Elimina
        </Button>
      </Stack>
    </Stack>
  );
};

const CampaignAsideContent: React.FC<{ campaignId: number }> = ({ campaignId }) => {
  const campaignQuery = useCampaignById(campaignId, { includes: 'campaign_type' });
  const campaign = campaignQuery.data?.campaigns[0];

  return (
    <>
      <AsideSummaryView title={campaign?.name ?? 'Caricamento...'} subtitle={campaign?.description ?? ''} />
      <AsideContentView sx={{ flexDirection: 'column', gap: 3, overflowY: 'scroll' }}>
        {campaign && (
          <>
            <CampaignActions campaign={campaign} />
            <Divider />
            <CampaignAsideForm key={campaign.id} campaign={campaign} />
          </>
        )}
      </AsideContentView>
    </>
  );
};

const CampaignAside = () => {
  const reset = useResetSelection();
  const activeId = useActiveId();
  const isSidebarOpen = useIsSidebarOpen();

  return (
    <SplitAside open={isSidebarOpen} onClose={reset} width={600}>
      {activeId && <CampaignAsideContent key={activeId} campaignId={Number(activeId)} />}
    </SplitAside>
  );
};
export default CampaignAside;
