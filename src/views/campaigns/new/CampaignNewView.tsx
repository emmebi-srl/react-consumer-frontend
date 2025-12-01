import React, { useMemo } from 'react';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useNavigate } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import { useCampaignPlaceholdersSearch, useCampaignTypes, useCreateCampaign } from '~/proxies/aries-proxy/campaigns';
import { CampaignCreate } from '~/types/aries-proxy/campaigns';
import CampaignTemplateDropZone from './components/CampaignTemplateDropZone';
import { Grid } from '@mui/system';
import { sanitize } from 'lettersanitizer';

const CampaignFormSchema = z.object({
  campaignTypeId: z
    .number({
      message: 'Tipo campagna obbligatorio',
    })
    .int()
    .positive(),
  mailSubject: z.string().min(1, { message: 'Oggetto email è obbligatorio' }),
  name: z.string().min(1, { message: 'Nome è obbligatorio' }),
  description: z.string().min(1, { message: 'Descrizione è obbligatoria' }),
  mailTemplate: z.string().min(1, { message: 'Modello email è obbligatorio' }),
  active: z.boolean(),
});

type CampaignFormValues = z.infer<typeof CampaignFormSchema>;

const CampaignNewView = () => {
  const navigate = useNavigate();
  const { data: campaignTypesData, isLoading: areCampaignTypesLoading } = useCampaignTypes();
  const { mutateAsync: createCampaign, isPending: isCreating, error: createError } = useCreateCampaign();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      campaignTypeId: undefined,
      name: '',
      description: '',
      mailTemplate: '',
      mailSubject: '',
      active: false,
    },
  });

  const campaignTypeId = form.watch('campaignTypeId');
  const { data: placeholdersData } = useCampaignPlaceholdersSearch(campaignTypeId ? { campaignTypeId } : {}, {
    enabled: Boolean(campaignTypeId),
  });

  const handleSubmit = async (values: CampaignFormValues) => {
    const payload: CampaignCreate = {
      campaignTypeId: values.campaignTypeId,
      name: values.name,
      description: values.description,
      mailTemplate: values.mailTemplate,
      active: values.active,
      mailSubject: values.mailSubject,
    };

    await createCampaign(payload);
    navigate(-1);
  };

  const campaignTypes = campaignTypesData?.campaignTypes ?? [];

  const templateBase64 = form.watch('mailTemplate');
  const templateHtml = useMemo(() => {
    if (!templateBase64) return '';
    return sanitize(atob(templateBase64));
  }, [templateBase64]);

  return (
    <PageContainer>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <Stack spacing={3}>
          <Typography variant="h5">Crea nuova campagna</Typography>
          {createError ? <Alert severity="error">Impossibile creare la campagna. Per favore riprova.</Alert> : null}
          <Grid container spacing={2}>
            <Grid size={6}>
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
            </Grid>
            <Grid size={6}>
              <TextField
                {...form.register('name')}
                label="Nome"
                fullWidth
                error={!!form.formState.errors.name}
                helperText={form.formState.errors.name?.message}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...form.register('description')}
                label="Descrizione"
                fullWidth
                multiline
                minRows={3}
                error={!!form.formState.errors.description}
                helperText={form.formState.errors.description?.message}
              />
            </Grid>
            <Grid size={8}>
              <TextField
                {...form.register('mailSubject')}
                label="Oggetto email"
                fullWidth
                sx={{ mb: 2 }}
                error={!!form.formState.errors.mailSubject}
                helperText={form.formState.errors.mailSubject?.message}
              />
              {templateHtml ? (
                <Card>
                  <CardHeader title="Anteprima template" />
                  <CardContent
                    sx={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitize(templateHtml),
                      }}
                    ></div>
                  </CardContent>
                  <CardActions>
                    <Button variant="outlined" color="error" onClick={() => form.setValue('mailTemplate', '')}>
                      Sostituisci
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <CampaignTemplateDropZone
                  onFileReady={({ base64 }) => {
                    form.setValue('mailTemplate', base64);
                  }}
                />
              )}
            </Grid>
            <Grid size={4}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Parametri Configurabili" />
                <CardContent
                  sx={{
                    maxHeight: '430px',
                    overflowY: 'auto',
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableCell>Paramentro</TableCell>
                      <TableCell>Descrizione</TableCell>
                    </TableHead>
                    <TableBody>
                      {placeholdersData?.campaignPlaceholders.length ? (
                        placeholdersData.campaignPlaceholders.map((placeholder) => (
                          <TableRow key={placeholder.name}>
                            <TableCell>
                              <code>{`{{${placeholder.name}}}`}</code>
                            </TableCell>
                            <TableCell>{placeholder.description}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Typography variant="body2" color="textSecondary">
                              Nessun parametro configurabile disponibile per questo tipo di campagna.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={12}>
              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    }
                    label="Attivo"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Stack>
        <Stack direction="row" gap={2} alignItems="center" justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={isCreating}>
            Annulla
          </Button>
          <Button type="submit" variant="contained" loading={isCreating}>
            Crea campagna
          </Button>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default CampaignNewView;
