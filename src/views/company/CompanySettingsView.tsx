import { AccountBalance, Add, Refresh, Save, UploadFile } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import PageContainer from '~/components/Layout/PageContainer';
import BankAccountBalancesModal from '~/components/Modals/BankAccountBalancesModal';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import {
  useBankAccounts,
  useBanks,
  useCompanyLogo,
  useCreateBankAccount,
  useCreateCompanySettings,
  useUpdateBankAccount,
  useUpdateCompanyLogo,
  useUpdateCompanySettings,
  useCompanySettings,
} from '~/proxies/aries-proxy/company';
import { Bank, BankAccount, CompanySettings } from '~/types/aries-proxy/company';

type StringField =
  | 'businessName'
  | 'sector'
  | 'address'
  | 'number'
  | 'postalCode'
  | 'municipality'
  | 'province'
  | 'hamlet'
  | 'phoneNumber'
  | 'mobileNumber'
  | 'fax'
  | 'email'
  | 'website'
  | 'vatNumber'
  | 'fiscalCode'
  | 'businessesRegisterProvince'
  | 'businessesRegisterNumber'
  | 'provincialRegisterProvince'
  | 'provincialRegisterNumber'
  | 'reaNumber'
  | 'inpsPosition'
  | 'inailPosition'
  | 'atecoCode'
  | 'rctInsurance'
  | 'shareCapital'
  | 'enabling'
  | 'smtp'
  | 'port'
  | 'emailUsername'
  | 'emailPassword'
  | 'emailFrom'
  | 'bankName'
  | 'iban'
  | 'reminderPrinter'
  | 'administrationEmail'
  | 'reminderHeader'
  | 'warningInvoiceElectronicallyPath'
  | 'circularWarrantyPath'
  | 'versionUpgradePath'
  | 'taxRegime';

type BooleanField =
  | 'isRegisteredInBusinessesRegister'
  | 'isRegisteredInProvincialRegister'
  | 'ssl'
  | 'printCompanyName'
  | 'printRi'
  | 'enableReportValidation';

type NumberField =
  | 'priceListId'
  | 'discount'
  | 'discountType'
  | 'daysReminderPaymentInvoices'
  | 'subscriptionRequestDaysReminder'
  | 'subscriptionRequestDaysNotAccepted'
  | 'multipleReportsDaysNotice';

type CompanySettingsForm = Record<StringField, string> & Record<BooleanField, boolean> & Record<NumberField, string>;

interface BankAccountForm {
  name: string;
  bankId: number | null;
  bank: Bank | null;
  iban: string;
  holder: string;
  notes: string;
  isDefaultForPayments: boolean;
}

const billingStringFields: StringField[] = [
  'businessName',
  'address',
  'number',
  'postalCode',
  'municipality',
  'province',
  'hamlet',
  'phoneNumber',
  'mobileNumber',
  'fax',
  'email',
  'website',
  'vatNumber',
  'fiscalCode',
  'businessesRegisterProvince',
  'businessesRegisterNumber',
  'provincialRegisterProvince',
  'provincialRegisterNumber',
  'reaNumber',
  'inpsPosition',
  'inailPosition',
  'atecoCode',
  'rctInsurance',
  'shareCapital',
  'bankName',
  'iban',
  'taxRegime',
];

const billingBooleanFields: BooleanField[] = [
  'isRegisteredInBusinessesRegister',
  'isRegisteredInProvincialRegister',
  'printCompanyName',
  'printRi',
];

const emptyForm: CompanySettingsForm = {
  businessName: '',
  sector: '',
  address: '',
  number: '',
  postalCode: '',
  municipality: '',
  province: '',
  hamlet: '',
  phoneNumber: '',
  mobileNumber: '',
  fax: '',
  email: '',
  website: '',
  vatNumber: '',
  fiscalCode: '',
  businessesRegisterProvince: '',
  businessesRegisterNumber: '',
  provincialRegisterProvince: '',
  provincialRegisterNumber: '',
  reaNumber: '',
  inpsPosition: '',
  inailPosition: '',
  atecoCode: '',
  rctInsurance: '',
  shareCapital: '',
  enabling: '',
  smtp: '',
  port: '',
  emailUsername: '',
  emailPassword: '',
  emailFrom: '',
  bankName: '',
  iban: '',
  reminderPrinter: '',
  administrationEmail: '',
  reminderHeader: '',
  warningInvoiceElectronicallyPath: '',
  circularWarrantyPath: '',
  versionUpgradePath: '',
  taxRegime: '',
  isRegisteredInBusinessesRegister: false,
  isRegisteredInProvincialRegister: false,
  ssl: false,
  printCompanyName: false,
  printRi: false,
  enableReportValidation: false,
  priceListId: '1',
  discount: '0',
  discountType: '0',
  daysReminderPaymentInvoices: '10',
  subscriptionRequestDaysReminder: '30',
  subscriptionRequestDaysNotAccepted: '60',
  multipleReportsDaysNotice: '7',
};

const textValue = (value?: string | null) => value ?? '';
const numberValue = (value?: number | null) => (value === null || value === undefined ? '' : String(value));
const nullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};
const numberOrDefault = (value: string, fallback: number) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
};
const nullableNumber = (value: string) => {
  if (value.trim().length === 0) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeComparableText = (value: string) => value.trim();
const emptyBankAccountForm: BankAccountForm = {
  name: '',
  bankId: null,
  bank: null,
  iban: '',
  holder: '',
  notes: '',
  isDefaultForPayments: false,
};

const formatDate = (value?: number | null) => (value ? new Date(value * 1000).toLocaleDateString('it-IT') : '-');
const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('it-IT', { currency: 'EUR', style: 'currency' }).format(value ?? 0);
const formatBankLabel = (bank?: Bank | null) => [bank?.name, bank?.abi].filter(Boolean).join(' - ');

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.includes(',') ? result.split(',')[1] || '' : result);
    };
    reader.readAsDataURL(file);
  });

const hasBillingDataChanges = (initial: CompanySettingsForm, current: CompanySettingsForm) => {
  const hasStringChanges = billingStringFields.some(
    (field) => normalizeComparableText(initial[field]) !== normalizeComparableText(current[field]),
  );

  if (hasStringChanges) return true;

  return billingBooleanFields.some((field) => initial[field] !== current[field]);
};

const toForm = (company: CompanySettings): CompanySettingsForm => ({
  ...emptyForm,
  businessName: textValue(company.businessName),
  sector: textValue(company.sector),
  address: textValue(company.address),
  number: textValue(company.number),
  postalCode: textValue(company.postalCode),
  municipality: textValue(company.municipality),
  province: textValue(company.province),
  hamlet: textValue(company.hamlet),
  phoneNumber: textValue(company.phoneNumber),
  mobileNumber: textValue(company.mobileNumber),
  fax: textValue(company.fax),
  email: textValue(company.email),
  website: textValue(company.website),
  vatNumber: textValue(company.vatNumber),
  fiscalCode: textValue(company.fiscalCode),
  businessesRegisterProvince: textValue(company.businessesRegisterProvince),
  businessesRegisterNumber: textValue(company.businessesRegisterNumber),
  provincialRegisterProvince: textValue(company.provincialRegisterProvince),
  provincialRegisterNumber: textValue(company.provincialRegisterNumber),
  reaNumber: textValue(company.reaNumber),
  inpsPosition: textValue(company.inpsPosition),
  inailPosition: textValue(company.inailPosition),
  atecoCode: textValue(company.atecoCode),
  rctInsurance: textValue(company.rctInsurance),
  shareCapital: textValue(company.shareCapital),
  enabling: textValue(company.enabling),
  smtp: textValue(company.smtp),
  port: textValue(company.port),
  emailUsername: textValue(company.emailUsername),
  emailPassword: textValue(company.emailPassword),
  emailFrom: textValue(company.emailFrom),
  bankName: textValue(company.bankName),
  iban: textValue(company.iban),
  reminderPrinter: textValue(company.reminderPrinter),
  administrationEmail: textValue(company.administrationEmail),
  reminderHeader: textValue(company.reminderHeader),
  warningInvoiceElectronicallyPath: textValue(company.warningInvoiceElectronicallyPath),
  circularWarrantyPath: textValue(company.circularWarrantyPath),
  versionUpgradePath: textValue(company.versionUpgradePath),
  taxRegime: textValue(company.taxRegime),
  isRegisteredInBusinessesRegister: company.isRegisteredInBusinessesRegister,
  isRegisteredInProvincialRegister: company.isRegisteredInProvincialRegister,
  ssl: company.ssl,
  printCompanyName: company.printCompanyName,
  printRi: company.printRi,
  enableReportValidation: Boolean(company.enableReportValidation),
  priceListId: numberValue(company.priceListId) || '1',
  discount: numberValue(company.discount) || '0',
  discountType: numberValue(company.discountType) || '0',
  daysReminderPaymentInvoices: numberValue(company.daysReminderPaymentInvoices) || '10',
  subscriptionRequestDaysReminder: numberValue(company.subscriptionRequestDaysReminder) || '30',
  subscriptionRequestDaysNotAccepted: numberValue(company.subscriptionRequestDaysNotAccepted) || '60',
  multipleReportsDaysNotice: numberValue(company.multipleReportsDaysNotice) || '7',
});

const toPayload = (form: CompanySettingsForm): CompanySettings => ({
  businessName: form.businessName.trim(),
  sector: nullableText(form.sector),
  address: nullableText(form.address),
  number: nullableText(form.number),
  postalCode: nullableText(form.postalCode),
  municipality: nullableText(form.municipality),
  province: nullableText(form.province),
  hamlet: nullableText(form.hamlet),
  phoneNumber: nullableText(form.phoneNumber),
  mobileNumber: nullableText(form.mobileNumber),
  fax: nullableText(form.fax),
  email: nullableText(form.email),
  website: nullableText(form.website),
  vatNumber: nullableText(form.vatNumber),
  fiscalCode: nullableText(form.fiscalCode),
  isRegisteredInBusinessesRegister: form.isRegisteredInBusinessesRegister,
  isRegisteredInProvincialRegister: form.isRegisteredInProvincialRegister,
  businessesRegisterProvince: nullableText(form.businessesRegisterProvince),
  businessesRegisterNumber: nullableText(form.businessesRegisterNumber),
  provincialRegisterProvince: nullableText(form.provincialRegisterProvince),
  provincialRegisterNumber: nullableText(form.provincialRegisterNumber),
  reaNumber: nullableText(form.reaNumber),
  inpsPosition: nullableText(form.inpsPosition),
  inailPosition: nullableText(form.inailPosition),
  atecoCode: nullableText(form.atecoCode),
  rctInsurance: nullableText(form.rctInsurance),
  shareCapital: nullableText(form.shareCapital),
  enabling: nullableText(form.enabling),
  smtp: nullableText(form.smtp),
  port: nullableText(form.port),
  ssl: form.ssl,
  emailUsername: nullableText(form.emailUsername),
  emailPassword: nullableText(form.emailPassword),
  emailFrom: nullableText(form.emailFrom),
  bankName: nullableText(form.bankName),
  iban: nullableText(form.iban),
  priceListId: numberOrDefault(form.priceListId, 1),
  discount: numberOrDefault(form.discount, 0),
  discountType: numberOrDefault(form.discountType, 0),
  printCompanyName: form.printCompanyName,
  printRi: form.printRi,
  daysReminderPaymentInvoices: numberOrDefault(form.daysReminderPaymentInvoices, 10),
  reminderPrinter: nullableText(form.reminderPrinter),
  administrationEmail: nullableText(form.administrationEmail),
  reminderHeader: nullableText(form.reminderHeader),
  enableReportValidation: form.enableReportValidation,
  warningInvoiceElectronicallyPath: nullableText(form.warningInvoiceElectronicallyPath),
  circularWarrantyPath: nullableText(form.circularWarrantyPath),
  subscriptionRequestDaysReminder: nullableNumber(form.subscriptionRequestDaysReminder),
  subscriptionRequestDaysNotAccepted: nullableNumber(form.subscriptionRequestDaysNotAccepted),
  versionUpgradePath: nullableText(form.versionUpgradePath),
  multipleReportsDaysNotice: nullableNumber(form.multipleReportsDaysNotice),
  taxRegime: nullableText(form.taxRegime),
});

interface SectionProps {
  title: string;
}

const Section: React.FC<PropsWithChildren<SectionProps>> = ({ children, title }) => (
  <Paper sx={{ p: 2, borderRadius: 1 }} variant="outlined">
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Stack>
  </Paper>
);

interface InputProps {
  form: CompanySettingsForm;
  label: string;
  name: StringField;
  onChange: (name: StringField, value: string) => void;
  md?: number;
  multiline?: boolean;
  type?: string;
}

const Input: React.FC<InputProps> = ({ form, label, md = 4, multiline, name, onChange, type }) => (
  <Grid size={{ xs: 12, md }}>
    <TextField
      fullWidth
      label={label}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      onChange={(event) => onChange(name, event.target.value)}
      size="small"
      type={type}
      value={form[name]}
    />
  </Grid>
);

interface NumberInputProps {
  form: CompanySettingsForm;
  label: string;
  name: NumberField;
  onChange: (name: NumberField, value: string) => void;
  md?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ form, label, md = 3, name, onChange }) => (
  <Grid size={{ xs: 12, sm: 6, md }}>
    <TextField
      fullWidth
      inputProps={{ inputMode: 'decimal' }}
      label={label}
      onChange={(event) => onChange(name, event.target.value)}
      size="small"
      value={form[name]}
    />
  </Grid>
);

interface SwitchInputProps {
  checked: boolean;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const SwitchInput: React.FC<SwitchInputProps> = ({ checked, label, onChange }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <FormControlLabel control={<Switch checked={checked} onChange={onChange} />} label={label} />
  </Grid>
);

const LogoSection = () => {
  const snackbar = useSnackbar();
  const { data: logo } = useCompanyLogo();
  const { mutateAsync: updateLogo, isPending } = useUpdateCompanyLogo();

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.type !== 'image/bmp' && !file.name.toLowerCase().endsWith('.bmp')) {
      snackbar.error('Il logo deve essere in formato BMP.');
      return;
    }

    const base64Content = await readFileAsBase64(file);
    await updateLogo({
      fileName: file.name,
      contentType: file.type || 'image/bmp',
      base64Content,
    });
    snackbar.success('Logo azienda salvato.');
  };

  return (
    <Section title="Logo azienda">
      <Grid size={{ xs: 12, md: 4 }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            height: 140,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {logo?.base64Content ? (
            <Box
              alt="Logo azienda"
              component="img"
              src={`data:${logo.contentType || 'image/bmp'};base64,${logo.base64Content}`}
              sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography color="text.secondary" variant="body2">
              Nessun logo caricato
            </Typography>
          )}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack alignItems="flex-start" spacing={1.5}>
          <Button component="label" disabled={isPending} startIcon={<UploadFile />} variant="outlined">
            Carica logo BMP
            <input accept=".bmp,image/bmp" hidden onChange={handleLogoChange} type="file" />
          </Button>
          {logo?.fileName ? (
            <Typography color="text.secondary" variant="body2">
              {logo.fileName}
            </Typography>
          ) : null}
        </Stack>
      </Grid>
    </Section>
  );
};

const toBankAccountPayload = (form: BankAccountForm): BankAccount => ({
  name: form.name.trim(),
  bankId: form.bank?.id ?? form.bankId,
  bank: form.bank,
  iban: nullableText(form.iban),
  holder: nullableText(form.holder),
  notes: nullableText(form.notes),
  isActive: true,
  isDefaultForPayments: form.isDefaultForPayments,
});

const BankAccountsSection = () => {
  const snackbar = useSnackbar();
  const modal = useModal();
  const { data: accounts = [], isLoading } = useBankAccounts();
  const [bankSearchText, setBankSearchText] = useState('');
  const { data: banks = [], isLoading: isLoadingBanks } = useBanks(bankSearchText);
  const { mutateAsync: createAccount, isPending: isCreatingAccount } = useCreateBankAccount();
  const { mutateAsync: updateAccount, isPending: isUpdatingAccount } = useUpdateBankAccount();
  const [accountForm, setAccountForm] = useState<BankAccountForm>(emptyBankAccountForm);

  const handleAccountFormChange = <K extends keyof BankAccountForm>(name: K, value: BankAccountForm[K]) => {
    setAccountForm((current) => ({ ...current, [name]: value }));
  };

  const handleAccountBankChange = (bank: Bank | null) => {
    setAccountForm((current) => ({ ...current, bank, bankId: bank?.id ?? null }));
  };

  const handleCreateAccount = async () => {
    if (!accountForm.name.trim()) {
      snackbar.error('Il nome conto e obbligatorio.');
      return;
    }

    if (!accountForm.bank?.id) {
      snackbar.error('La banca e obbligatoria.');
      return;
    }

    await createAccount(toBankAccountPayload(accountForm));
    setAccountForm(emptyBankAccountForm);
    snackbar.success('Conto bancario inserito.');
  };

  const handleToggleAccount = async (account: BankAccount, isActive: boolean) => {
    if (!account.id) return;

    await updateAccount({ id: account.id, model: { ...account, isActive } });
    snackbar.success(isActive ? 'Conto riattivato.' : 'Conto disattivato.');
  };

  const handleToggleDefaultForPayments = async (account: BankAccount, isDefaultForPayments: boolean) => {
    if (!account.id) return;

    await updateAccount({ id: account.id, model: { ...account, isDefaultForPayments } });
    snackbar.success(
      isDefaultForPayments ? 'Conto impostato come default per i pagamenti.' : 'Default pagamenti rimosso.',
    );
  };

  const openBalancesModal = (account: BankAccount) => {
    modal.showModal({
      component: BankAccountBalancesModal,
      props: { account },
    });
  };

  return (
    <>
      <Section title="Conti bancari">
        <Grid size={{ xs: 12 }}>
          <Stack spacing={2}>
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Nome conto"
                  onChange={(event) => handleAccountFormChange('name', event.target.value)}
                  size="small"
                  value={accountForm.name}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  getOptionLabel={(bank) => formatBankLabel(bank)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={isLoadingBanks}
                  onChange={(_, bank) => handleAccountBankChange(bank)}
                  onInputChange={(_, value, reason) => {
                    if (reason !== 'reset') setBankSearchText(value);
                  }}
                  options={banks}
                  renderInput={(params) => <TextField {...params} fullWidth label="Banca" size="small" />}
                  value={accountForm.bank}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="IBAN"
                  onChange={(event) => handleAccountFormChange('iban', event.target.value)}
                  size="small"
                  value={accountForm.iban}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Intestatario"
                  onChange={(event) => handleAccountFormChange('holder', event.target.value)}
                  size="small"
                  value={accountForm.holder}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Note"
                  onChange={(event) => handleAccountFormChange('notes', event.target.value)}
                  size="small"
                  value={accountForm.notes}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={accountForm.isDefaultForPayments}
                      onChange={(event) => handleAccountFormChange('isDefaultForPayments', event.target.checked)}
                    />
                  }
                  label="Default pagamenti"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button
                  disabled={isCreatingAccount}
                  fullWidth
                  onClick={handleCreateAccount}
                  startIcon={<Add />}
                  sx={{ height: 40 }}
                  variant="contained"
                >
                  Inserisci
                </Button>
              </Grid>
            </Grid>

            {isLoading ? <Alert severity="info">Caricamento conti bancari...</Alert> : null}
            {!isLoading && accounts.length === 0 ? (
              <Alert severity="info">Nessun conto bancario presente.</Alert>
            ) : null}

            {accounts.map((account) => (
              <Box
                key={account.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      alignItems: { xs: 'flex-start', md: 'center' },
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 1,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccountBalance color="action" fontSize="small" />
                      <Box>
                        <Typography fontWeight={700}>{account.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {[formatBankLabel(account.bank), account.iban].filter(Boolean).join(' - ') || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                    >
                      <Typography variant="body2">
                        Ultimo saldo: <strong>{formatCurrency(account.latestBalance?.amount)}</strong>
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {formatDate(account.latestBalance?.balanceDate)}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={account.isDefaultForPayments}
                            disabled={isUpdatingAccount || !account.isActive}
                            onChange={(event) => handleToggleDefaultForPayments(account, event.target.checked)}
                          />
                        }
                        label="Default pagamenti"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={account.isActive}
                            disabled={isUpdatingAccount}
                            onChange={(event) => handleToggleAccount(account, event.target.checked)}
                          />
                        }
                        label="Attivo"
                      />
                      <Button
                        disabled={!account.id}
                        onClick={() => openBalancesModal(account)}
                        startIcon={<Add />}
                        variant="outlined"
                      >
                        SALDO
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Section>
    </>
  );
};

const CompanySettingsView = () => {
  const snackbar = useSnackbar();
  const modal = useModal();
  const { data, error, isLoading } = useCompanySettings();
  const { mutateAsync: updateCompany, isPending } = useUpdateCompanySettings();
  const { mutateAsync: createCompany, isPending: isCreating } = useCreateCompanySettings();
  const [form, setForm] = useState<CompanySettingsForm>(emptyForm);

  useEffect(() => {
    if (data) setForm(toForm(data));
  }, [data]);

  const validationError = useMemo(() => {
    if (!form.businessName.trim()) return 'La ragione sociale e obbligatoria.';
    if (form.taxRegime.trim() && !/^RF\d{2}$/i.test(form.taxRegime.trim())) {
      return 'Il regime fiscale deve essere nel formato RF00.';
    }
    return null;
  }, [form.businessName, form.taxRegime]);

  const handleTextChange = (name: StringField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleNumberChange = (name: NumberField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleBooleanChange = (name: BooleanField, value: boolean) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleReset = () => {
    if (data) setForm(toForm(data));
  };

  const handleSubmit = async () => {
    if (validationError) {
      snackbar.error(validationError);
      return;
    }

    const shouldAskForCompanyVersion = data && hasBillingDataChanges(toForm(data), form);
    const payload = toPayload(form);
    let shouldCreateCompany = false;

    if (shouldAskForCompanyVersion) {
      const result = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: 'Dati di fatturazione modificati',
          alertSeverity: 'warning',
          alertText: 'La scelta influenza i documenti gia collegati alla vecchia azienda.',
          text: 'Scegli SI per creare una nuova azienda e lasciare invariati i vecchi documenti. Scegli NO per modificare la vecchia azienda e aggiornare anche i documenti gia collegati.',
        },
      });

      if (result.action === 'CLOSE') return;
      shouldCreateCompany = result.action === 'YES';
    }

    const updated = shouldCreateCompany ? await createCompany(payload) : await updateCompany(payload);
    setForm(toForm(updated));
    snackbar.success(shouldCreateCompany ? 'Nuova azienda creata.' : 'Azienda aggiornata.');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Alert severity="info">Caricamento azienda...</Alert>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">Non e stato possibile caricare i dati azienda.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={2.5}>
        <Box
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Gestione azienda
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {form.businessName || 'Azienda'}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              disabled={!data || isPending || isCreating}
              onClick={handleReset}
              startIcon={<Refresh />}
              variant="outlined"
            >
              Ripristina
            </Button>
            <Button
              disabled={isPending || isCreating || Boolean(validationError)}
              onClick={handleSubmit}
              startIcon={<Save />}
              variant="contained"
            >
              Salva
            </Button>
          </Stack>
        </Box>

        {validationError ? <Alert severity="warning">{validationError}</Alert> : null}

        <LogoSection />

        <Section title="Recapiti">
          <Input form={form} label="Ragione sociale" name="businessName" onChange={handleTextChange} md={6} />
          <Input form={form} label="Settore" name="sector" onChange={handleTextChange} md={6} />
          <Input form={form} label="Partita IVA" name="vatNumber" onChange={handleTextChange} />
          <Input form={form} label="Codice fiscale" name="fiscalCode" onChange={handleTextChange} />
          <Input form={form} label="Telefono" name="phoneNumber" onChange={handleTextChange} />
          <Input form={form} label="Cellulare" name="mobileNumber" onChange={handleTextChange} />
          <Input form={form} label="Fax" name="fax" onChange={handleTextChange} />
          <Input form={form} label="E-mail" name="email" onChange={handleTextChange} type="email" />
          <Input form={form} label="Sito internet" name="website" onChange={handleTextChange} />
          <SwitchInput
            checked={form.printCompanyName}
            label="Stampa ragione sociale"
            onChange={(event) => handleBooleanChange('printCompanyName', event.target.checked)}
          />
          <SwitchInput
            checked={form.printRi}
            label="Stampa R.I."
            onChange={(event) => handleBooleanChange('printRi', event.target.checked)}
          />
        </Section>

        <Section title="Luogo">
          <Input form={form} label="Indirizzo" name="address" onChange={handleTextChange} md={5} />
          <Input form={form} label="Numero" name="number" onChange={handleTextChange} md={2} />
          <Input form={form} label="CAP" name="postalCode" onChange={handleTextChange} md={2} />
          <Input form={form} label="Provincia" name="province" onChange={handleTextChange} md={3} />
          <Input form={form} label="Comune" name="municipality" onChange={handleTextChange} md={6} />
          <Input form={form} label="Frazione" name="hamlet" onChange={handleTextChange} md={6} />
          <Input
            form={form}
            label="Percorso default aggiornamento Aries"
            name="versionUpgradePath"
            onChange={handleTextChange}
            md={12}
          />
        </Section>

        <Section title="Dati anagrafici">
          <SwitchInput
            checked={form.isRegisteredInProvincialRegister}
            label="Iscritta all'albo provinciale"
            onChange={(event) => handleBooleanChange('isRegisteredInProvincialRegister', event.target.checked)}
          />
          <SwitchInput
            checked={form.isRegisteredInBusinessesRegister}
            label="Iscritta al registro imprese"
            onChange={(event) => handleBooleanChange('isRegisteredInBusinessesRegister', event.target.checked)}
          />
          <Input form={form} label="Provincia albo" name="provincialRegisterProvince" onChange={handleTextChange} />
          <Input form={form} label="Numero albo" name="provincialRegisterNumber" onChange={handleTextChange} />
          <Input form={form} label="Provincia C.I.A.A." name="businessesRegisterProvince" onChange={handleTextChange} />
          <Input form={form} label="Numero C.I.A.A." name="businessesRegisterNumber" onChange={handleTextChange} />
          <Input form={form} label="Numero REA" name="reaNumber" onChange={handleTextChange} />
          <Input form={form} label="Posizione INPS" name="inpsPosition" onChange={handleTextChange} />
          <Input form={form} label="Posizione INAIL" name="inailPosition" onChange={handleTextChange} />
          <Input form={form} label="Codice ATECO" name="atecoCode" onChange={handleTextChange} />
          <Input form={form} label="Assicurazione RCT" name="rctInsurance" onChange={handleTextChange} />
          <Input form={form} label="Capitale sociale" name="shareCapital" onChange={handleTextChange} />
          <Input form={form} label="Abilitazione" name="enabling" onChange={handleTextChange} />
          <Input form={form} label="Regime fiscale" name="taxRegime" onChange={handleTextChange} />
          <Input form={form} label="Banca" name="bankName" onChange={handleTextChange} md={6} />
          <Input form={form} label="IBAN" name="iban" onChange={handleTextChange} md={6} />
        </Section>

        <BankAccountsSection />

        <Section title="PEC e listino">
          <Input form={form} label="SMTP" name="smtp" onChange={handleTextChange} />
          <Input form={form} label="Porta" name="port" onChange={handleTextChange} />
          <Input form={form} label="Utente" name="emailUsername" onChange={handleTextChange} />
          <Input form={form} label="Password" name="emailPassword" onChange={handleTextChange} type="password" />
          <Input form={form} label="Nome visualizzato" name="emailFrom" onChange={handleTextChange} />
          <SwitchInput
            checked={form.ssl}
            label="SSL"
            onChange={(event) => handleBooleanChange('ssl', event.target.checked)}
          />
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Listino"
              onChange={(event) => handleNumberChange('priceListId', event.target.value)}
              select
              size="small"
              value={form.priceListId}
            >
              <MenuItem value="1">Netto</MenuItem>
              <MenuItem value="2">Lordo</MenuItem>
              <MenuItem value="3">Ultimo acquisto</MenuItem>
            </TextField>
          </Grid>
          <NumberInput form={form} label="Sconto" name="discount" onChange={handleNumberChange} md={4} />
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Tipo sconto"
              onChange={(event) => handleNumberChange('discountType', event.target.value)}
              select
              size="small"
              value={form.discountType}
            >
              <MenuItem value="0">Normale</MenuItem>
              <MenuItem value="1">Ricarico con sconto &lt; 0</MenuItem>
              <MenuItem value="2">Ricarico su prezzo</MenuItem>
            </TextField>
          </Grid>
        </Section>

        <Section title="Documenti e promemoria">
          <Input
            form={form}
            label='File "Invio telematico"'
            name="warningInvoiceElectronicallyPath"
            onChange={handleTextChange}
            md={6}
          />
          <Input
            form={form}
            label='File "Richiesta di abbonamento"'
            name="circularWarrantyPath"
            onChange={handleTextChange}
            md={6}
          />
          <NumberInput
            form={form}
            label="Notifica attesa richiesta"
            name="subscriptionRequestDaysReminder"
            onChange={handleNumberChange}
          />
          <NumberInput
            form={form}
            label="Passa a non accettato dopo"
            name="subscriptionRequestDaysNotAccepted"
            onChange={handleNumberChange}
          />
          <NumberInput
            form={form}
            label="Promemoria pagamento fatture"
            name="daysReminderPaymentInvoices"
            onChange={handleNumberChange}
          />
          <NumberInput
            form={form}
            label="Avviso rapporti stesso cliente"
            name="multipleReportsDaysNotice"
            onChange={handleNumberChange}
          />
          <Input form={form} label="Stampante predefinita" name="reminderPrinter" onChange={handleTextChange} md={6} />
          <Input
            form={form}
            label="E-mail amministrazione"
            name="administrationEmail"
            onChange={handleTextChange}
            md={6}
          />
          <Input
            form={form}
            label="Intestazione promemoria"
            name="reminderHeader"
            onChange={handleTextChange}
            multiline
            md={12}
          />
          <SwitchInput
            checked={form.enableReportValidation}
            label="Abilita firme per convalida rapporto"
            onChange={(event) => handleBooleanChange('enableReportValidation', event.target.checked)}
          />
        </Section>
      </Stack>
    </PageContainer>
  );
};

export default CompanySettingsView;
