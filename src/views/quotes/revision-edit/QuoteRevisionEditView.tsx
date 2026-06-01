import { useEffect } from 'react';
import { ArrowBack, Save } from '@mui/icons-material';
import { Alert, Button, CircularProgress, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import { useQuoteRevisionById, useUpdateQuoteRevision } from '~/proxies/aries-proxy/quotes';
import { RouteConfig } from '~/routes/routeConfig';
import { QuoteRevisionUpdate } from '~/types/aries-proxy/quotes';

interface FormValues {
  body: string;
  courtesy: string;
  discountPercent: string;
  hourCost: string;
  hourPrice: string;
  markUpPercentage: string;
  markUpType: string;
  note: string;
  printed: boolean;
  revisionDate: string;
  sent: boolean;
  siteIn: string;
  subject: string;
  vatId: string;
}

const defaultValues: FormValues = {
  body: '',
  courtesy: '',
  discountPercent: '0',
  hourCost: '0',
  hourPrice: '0',
  markUpPercentage: '',
  markUpType: '',
  note: '',
  printed: false,
  revisionDate: '',
  sent: false,
  siteIn: '',
  subject: '',
  vatId: '0',
};

const toInputDate = (value?: string | null) => (value ? value.slice(0, 10) : '');

const toNumber = (value: string, fallback = 0) => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : fallback;
};

const toNullableNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
};

const QuoteRevisionEditView = () => {
  const navigate = useNavigate();
  const params = useParams<{ quoteId?: string; revisionId?: string; year?: string }>();
  const year = Number(params.year);
  const quoteId = Number(params.quoteId);
  const revisionId = Number(params.revisionId);

  const revisionQuery = useQuoteRevisionById(year, quoteId, revisionId);
  const updateRevision = useUpdateQuoteRevision();

  const form = useForm<FormValues>({
    defaultValues,
  });

  const revision = revisionQuery.data?.revisions.at(0);

  useEffect(() => {
    if (!revision) return;

    form.reset({
      body: revision.body ?? '',
      courtesy: revision.courtesy ?? '',
      discountPercent: String(revision.discountPercent),
      hourCost: String(revision.hourCost),
      hourPrice: String(revision.hourPrice),
      markUpPercentage: revision.markUpPercentage == null ? '' : String(revision.markUpPercentage),
      markUpType: revision.markUpType == null ? '' : String(revision.markUpType),
      note: revision.note ?? '',
      printed: revision.printed,
      revisionDate: toInputDate(revision.revisionDate),
      sent: revision.sent,
      siteIn: revision.siteIn ?? '',
      subject: revision.subject ?? '',
      vatId: String(revision.vatId),
    });
  }, [form, revision]);

  const handleSubmit = async (values: FormValues) => {
    const payload: QuoteRevisionUpdate = {
      body: values.body || null,
      courtesy: values.courtesy || null,
      discountPercent: toNumber(values.discountPercent),
      hourCost: toNumber(values.hourCost),
      hourPrice: toNumber(values.hourPrice),
      markUpPercentage: toNullableNumber(values.markUpPercentage),
      markUpType: toNullableNumber(values.markUpType),
      note: values.note || null,
      printed: values.printed,
      revisionDate: values.revisionDate || null,
      sent: values.sent,
      siteIn: values.siteIn || null,
      subject: values.subject || null,
      vatId: toNumber(values.vatId),
    };

    await updateRevision.mutateAsync({
      data: payload,
      id: quoteId,
      revisionId,
      year,
    });
    navigate(RouteConfig.QuoteDetail.buildLink({ quoteId: String(quoteId), year: String(year) }));
  };

  const isInvalidRoute = year <= 0 || quoteId <= 0 || revisionId < 0 || Number.isNaN(revisionId);

  return (
    <PageContainer>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Stack spacing={0.5}>
              <Typography variant="h5">Modifica revisione</Typography>
              <Typography variant="body2" color="text.secondary">
                Preventivo #{quoteId} / {year} - Rev. {revisionId}
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to={RouteConfig.QuoteDetail.buildLink({ quoteId: String(quoteId), year: String(year) })}
              startIcon={<ArrowBack />}
              variant="outlined"
            >
              Dettaglio
            </Button>
          </Stack>

          {isInvalidRoute ? <Alert severity="error">Riferimento revisione non valido.</Alert> : null}
          {revisionQuery.isLoading ? <CircularProgress size={28} /> : null}
          {revisionQuery.error ? <Alert severity="error">Impossibile caricare la revisione.</Alert> : null}
          {updateRevision.error ? <Alert severity="error">Impossibile salvare la revisione.</Alert> : null}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField {...form.register('subject')} fullWidth label="Oggetto" />
            <TextField {...form.register('courtesy')} fullWidth label="Formula di cortesia" />
            <TextField
              {...form.register('revisionDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label="Data revisione"
              type="date"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField {...form.register('discountPercent')} fullWidth inputMode="decimal" label="Sconto %" />
            <TextField {...form.register('hourPrice')} fullWidth inputMode="decimal" label="Prezzo ora" />
            <TextField {...form.register('hourCost')} fullWidth inputMode="decimal" label="Costo ora" />
            <TextField {...form.register('vatId')} fullWidth inputMode="numeric" label="IVA" />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField {...form.register('markUpType')} fullWidth inputMode="numeric" label="Tipo ricarico" />
            <TextField {...form.register('markUpPercentage')} fullWidth inputMode="decimal" label="Ricarico %" />
            <TextField {...form.register('siteIn')} fullWidth label="Cantiere" />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Controller
              control={form.control}
              name="printed"
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                  label="Stampata"
                />
              )}
            />
            <Controller
              control={form.control}
              name="sent"
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                  label="Inviata"
                />
              )}
            />
          </Stack>

          <TextField {...form.register('note')} fullWidth label="Nota" minRows={3} multiline />
          <TextField {...form.register('body')} fullWidth label="Corpo" minRows={8} multiline />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => navigate(-1)} variant="outlined">
              Annulla
            </Button>
            <Button loading={updateRevision.isPending} startIcon={<Save />} type="submit" variant="contained">
              Salva
            </Button>
          </Stack>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default QuoteRevisionEditView;
