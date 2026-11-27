import { useEffect, useRef } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import DetailPageHeader from '~/components/Layout/DetailPageHeader';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import useSnackbar from '~/hooks/useSnackbar';
import { useInvoiceSettings, useSaveInvoiceSettings } from '~/proxies/aries-proxy/invoices';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import {
  INVOICE_IMPORT_REPORTS_OPTIONS,
  INVOICE_PRICE_SOURCE_OPTIONS,
  InvoiceSettings,
} from '~/types/aries-proxy/invoices';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import SdICoopStatusCard from './components/SdICoopStatusCard';

type Values = Omit<InvoiceSettings, 'certificates' | 'certificateSignId'> & { certificateSignId: number | '' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SDI_INFO =
  "Il primo invio al SdI tramite PEC va fatto all'indirizzo generico sdi01@pec.fatturapa.it: il SdI comunica poi " +
  "l'indirizzo PEC da usare per gli invii successivi.";

const toValues = (settings: InvoiceSettings): Values => ({
  firstColumnIsBrand: settings.firstColumnIsBrand,
  thirdColumnIsSupplierCode: settings.thirdColumnIsSupplierCode,
  fixedNote: settings.fixedNote ?? '',
  emailNote: settings.emailNote ?? '',
  importReports: settings.importReports,
  priceSource: settings.priceSource,
  hideZeroDiscount: settings.hideZeroDiscount,
  hideZeroPrice: settings.hideZeroPrice,
  hideSystemName: settings.hideSystemName,
  certificateSignId: settings.certificateSignId ?? '',
  sdiEmail: settings.sdiEmail ?? '',
  statementEmailText: settings.statementEmailText ?? '',
  statementReplyToEmail: settings.statementReplyToEmail ?? '',
  statementSenderEmail: settings.statementSenderEmail ?? '',
  customerCodeLabel: settings.customerCodeLabel ?? '',
  backgroundLogo: settings.backgroundLogo,
});

const emailRule = (message: string) => ({
  validate: (value?: string | null) => !value?.trim() || EMAIL_PATTERN.test(value.trim()) || message,
});

/**
 * Delphi TFInvoiceSettings: courtesy print, import of the documents, email texts, e-invoice signature and SDI address,
 * invoices statement. The two options of the Delphi INI file (year filter, system warranty) are local to the client.
 */
const InvoiceSettingsView = () => {
  const snackbar = useSnackbar();
  const { permission } = useModulePermission(AriesModule.Invoices);
  const canEdit = !!permission?.canEdit;
  const settingsQuery = useInvoiceSettings();
  const saveMutation = useSaveInvoiceSettings();
  const settings = settingsQuery.data;
  const form = useForm<Values>();
  const { control, formState } = form;
  const fixedNoteRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (settings) form.reset(toValues(settings));
  }, [settings, form]);

  /** Delphi buttons BANCA / IBAN: the placeholder goes where the cursor is. */
  const insertPlaceholder = (placeholder: string) => {
    const current = form.getValues('fixedNote') ?? '';
    const input = fixedNoteRef.current;
    const start = input?.selectionStart ?? current.length;
    const end = input?.selectionEnd ?? start;
    form.setValue('fixedNote', current.slice(0, start) + placeholder + current.slice(end), { shouldDirty: true });
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + placeholder.length, start + placeholder.length);
    });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      await saveMutation.mutateAsync({
        ...values,
        certificateSignId: values.certificateSignId === '' ? null : values.certificateSignId,
      });
      snackbar.success('Impostazioni salvate');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile salvare le impostazioni.'));
    }
  });

  const checkbox = (
    name: 'hideZeroDiscount' | 'hideZeroPrice' | 'hideSystemName' | 'backgroundLogo',
    label: string,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          disabled={!canEdit}
          label={label}
          control={<Checkbox checked={!!field.value} onChange={(event) => field.onChange(event.target.checked)} />}
        />
      )}
    />
  );

  return (
    <PageContainer>
      <Stack component="form" spacing={2.5} onSubmit={submit} sx={{ pb: 10 }}>
        <DetailPageHeader backTo={RouteConfig.InvoiceList.buildLink()} title="Impostazioni fattura" />

        {settingsQuery.isError ? (
          <Alert severity="error">{getApiErrorMessage(settingsQuery.error, 'Impostazioni non disponibili.')}</Alert>
        ) : !settings ? (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            <Card variant="outlined">
              <CardHeader title="Stampa fattura" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Controller
                      name="firstColumnIsBrand"
                      control={control}
                      render={({ field }) => (
                        <FormControl disabled={!canEdit}>
                          <FormLabel>Prima colonna</FormLabel>
                          <RadioGroup
                            value={field.value ? 'brand' : 'code'}
                            onChange={(event) => field.onChange(event.target.value === 'brand')}
                          >
                            <FormControlLabel value="code" control={<Radio />} label="Codice articolo interno" />
                            <FormControlLabel value="brand" control={<Radio />} label="Marca" />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="thirdColumnIsSupplierCode"
                      control={control}
                      render={({ field }) => (
                        <FormControl disabled={!canEdit}>
                          <FormLabel>Terza colonna</FormLabel>
                          <RadioGroup
                            value={field.value ? 'supplier' : 'serial'}
                            onChange={(event) => field.onChange(event.target.value === 'supplier')}
                          >
                            <FormControlLabel value="serial" control={<Radio />} label="Serial number" />
                            <FormControlLabel value="supplier" control={<Radio />} label="Codice fornitore" />
                          </RadioGroup>
                        </FormControl>
                      )}
                    />
                    <Stack>
                      {checkbox('hideZeroDiscount', 'Nascondi sconto a 0')}
                      {checkbox('hideZeroPrice', 'Nascondi prezzo a 0')}
                      {checkbox('hideSystemName', 'Nascondi nome impianto (rif. rapporto)')}
                      {checkbox('backgroundLogo', 'Abilita logo sfondo')}
                    </Stack>
                  </Stack>
                  <Controller
                    name="customerCodeLabel"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        disabled={!canEdit}
                        size="small"
                        label="Etichetta codice cliente"
                        placeholder="COD.CLIE."
                        sx={{ maxWidth: 320 }}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                      />
                    )}
                  />
                  <Controller
                    name="fixedNote"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        inputRef={fixedNoteRef}
                        disabled={!canEdit}
                        multiline
                        minRows={3}
                        size="small"
                        label="Note automatiche"
                        helperText="Stampate sotto le righe. %BANCA e %IBAN diventano la banca e l'IBAN della fattura."
                      />
                    )}
                  />
                  {canEdit ? (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => insertPlaceholder('%BANCA')}>
                        Inserisci banca
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => insertPlaceholder('%IBAN')}>
                        Inserisci IBAN
                      </Button>
                    </Stack>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Importazione documenti" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="importReports"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        {...field}
                        disabled={!canEdit}
                        size="small"
                        label="Importa rapporto"
                        sx={{ minWidth: 260 }}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {INVOICE_IMPORT_REPORTS_OPTIONS.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="priceSource"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        {...field}
                        disabled={!canEdit}
                        size="small"
                        label="Prezzi DDT"
                        sx={{ minWidth: 260 }}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      >
                        {INVOICE_PRICE_SOURCE_OPTIONS.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Invio per email" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Controller
                  name="emailNote"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      disabled={!canEdit}
                      fullWidth
                      multiline
                      minRows={3}
                      size="small"
                      label="Testo mail"
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Fattura elettronica" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="certificateSignId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        {...field}
                        disabled={!canEdit}
                        size="small"
                        label="Certificato firma"
                        sx={{ minWidth: 280 }}
                        helperText="La firma .p7m resta sul client Delphi: dal web si scarica l'XML."
                        onChange={(event) =>
                          field.onChange(event.target.value === '' ? '' : Number(event.target.value))
                        }
                      >
                        <MenuItem value="">Nessuno</MenuItem>
                        {(settings.certificates ?? []).map((certificate) => (
                          <MenuItem key={certificate.id} value={certificate.id}>
                            {certificate.refName || certificate.name}
                            {certificate.validTo
                              ? ` (scade ${format(getDateByUnixtimestamp({ unixTimestamp: certificate.validTo }), 'dd/MM/yyyy')})`
                              : ''}
                            {certificate.isActive ? '' : ' - non attivo'}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="sdiEmail"
                    control={control}
                    rules={emailRule("L'Email inserita per il sistema SDI non è valida.")}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        disabled={!canEdit}
                        size="small"
                        label="Email SDI"
                        sx={{ minWidth: 280 }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          htmlInput: { maxLength: 100 },
                          input: {
                            endAdornment: (
                              <Tooltip title={SDI_INFO}>
                                <InfoOutlined fontSize="small" color="action" />
                              </Tooltip>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>

            <SdICoopStatusCard />

            <Card variant="outlined">
              <CardHeader title="Estratto conto" titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Controller
                      name="statementSenderEmail"
                      control={control}
                      rules={emailRule(
                        'L\'Email inserita come "indirizzo mail di invio" per l\'estratto conto non è valida.',
                      )}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          disabled={!canEdit}
                          size="small"
                          label="Mail di invio"
                          sx={{ minWidth: 280 }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{ htmlInput: { maxLength: 150 } }}
                        />
                      )}
                    />
                    <Controller
                      name="statementReplyToEmail"
                      control={control}
                      rules={emailRule(
                        'L\'Email inserita come "indirizzo mail di risposta" per l\'estratto conto non è valida.',
                      )}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ''}
                          disabled={!canEdit}
                          size="small"
                          label="Mail di risposta"
                          sx={{ minWidth: 280 }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{ htmlInput: { maxLength: 150 } }}
                        />
                      )}
                    />
                  </Stack>
                  <Controller
                    name="statementEmailText"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        disabled={!canEdit}
                        multiline
                        minRows={3}
                        size="small"
                        label="Testo mail"
                      />
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>
          </>
        )}

        {settings && canEdit && formState.isDirty ? (
          <FormSaveBar
            saving={saveMutation.isPending}
            cancelLabel="Annulla modifiche"
            submitLabel="Salva impostazioni"
            onCancel={() => form.reset(toValues(settings))}
          />
        ) : null}
      </Stack>
    </PageContainer>
  );
};

export default InvoiceSettingsView;
