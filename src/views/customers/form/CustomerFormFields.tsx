import { ReactNode } from 'react';
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Control, Controller, FieldNamesMarkedBoolean, UseFormSetValue, useWatch } from 'react-hook-form';
import {
  useCustomerActivityTypes,
  useCustomerAgents,
  useCustomerPaymentConditions,
  useCustomerRelationshipTypes,
  useCustomerStatuses,
  useCustomerTypes,
} from '~/proxies/aries-proxy/customers';
import { useFrazioniByComune } from '~/proxies/aries-proxy/geo';
import { CustomerDestination } from '~/types/aries-proxy/customers';
import ComuneAutocomplete from '../components/ComuneAutocomplete';
import { CustomerFormValues } from './customerFormValues';

const DIRTY_FIELD_SX = { '& .MuiInputBase-root': { backgroundColor: '#fff9c4' } };

type FieldName = Exclude<keyof CustomerFormValues, 'isInsolvent'>;

interface FormTextFieldProps {
  control: Control<CustomerFormValues>;
  name: FieldName;
  label: string;
  width: number;
  highlighted: boolean;
  numeric?: boolean;
  requiredMessage?: string;
  select?: boolean;
  children?: ReactNode;
}

const FormTextField: React.FC<FormTextFieldProps> = ({
  control,
  name,
  label,
  width,
  highlighted,
  numeric,
  requiredMessage,
  select,
  children,
}) => (
  <Controller
    name={name}
    control={control}
    rules={requiredMessage ? { validate: (value) => String(value).trim() !== '' || requiredMessage } : undefined}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        select={select}
        type={numeric && !select ? 'number' : undefined}
        label={label}
        size="small"
        required={!!requiredMessage}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        sx={{ minWidth: width, flex: `1 1 ${width}px`, ...(highlighted ? DIRTY_FIELD_SX : {}) }}
        onChange={(e) =>
          field.onChange(numeric ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
        }
      >
        {children}
      </TextField>
    )}
  />
);

type LookupFieldName = 'activityId' | 'paymentConditionId' | 'agentId';

interface LookupOption {
  id: number;
  name?: string | null;
}

interface FormLookupFieldProps {
  control: Control<CustomerFormValues>;
  name: LookupFieldName;
  label: string;
  width: number;
  highlighted: boolean;
  options: LookupOption[];
  loading: boolean;
  disableClearable?: boolean;
}

const FormLookupField: React.FC<FormLookupFieldProps> = ({
  control,
  name,
  label,
  width,
  highlighted,
  options,
  loading,
  disableClearable,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => {
      // A saved id missing from the list (e.g. an agent no longer active) is still shown instead of looking empty.
      const selected =
        field.value === ''
          ? null
          : (options.find((option) => option.id === field.value) ??
            (loading ? null : { id: field.value, name: `#${field.value}` }));

      return (
        <Autocomplete
          options={options}
          value={selected}
          loading={loading}
          disableClearable={disableClearable && selected !== null}
          getOptionLabel={(option) => option.name || `#${option.id}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_event, value) => field.onChange(value?.id ?? '')}
          onBlur={field.onBlur}
          sx={{ minWidth: width, flex: `1 1 ${width}px`, ...(highlighted ? DIRTY_FIELD_SX : {}) }}
          renderInput={(params) => <TextField {...params} size="small" label={label} />}
        />
      );
    }}
  />
);

interface ComuneFieldsProps {
  control: Control<CustomerFormValues>;
  setValue: UseFormSetValue<CustomerFormValues>;
  isCreate: boolean;
  mainDestination?: CustomerDestination;
  isHighlighted: (name: keyof CustomerFormValues) => boolean;
}

const ComuneFields: React.FC<ComuneFieldsProps> = ({ control, setValue, isCreate, mainDestination, isHighlighted }) => {
  const comuneId = useWatch({ control, name: 'destinationComuneId' });
  const frazioniQuery = useFrazioniByComune(comuneId === '' ? null : comuneId);
  const frazioni = frazioniQuery.data?.frazioni ?? [];
  const initialComune = mainDestination?.comuneId
    ? { id: mainDestination.comuneId, name: mainDestination.municipality, province: mainDestination.province }
    : null;

  return (
    <>
      <Controller
        name="destinationComuneId"
        control={control}
        rules={isCreate ? { validate: (value) => value !== '' || 'Il comune è obbligatorio' } : undefined}
        render={({ field, fieldState }) => (
          <ComuneAutocomplete
            value={field.value}
            initialComune={initialComune}
            onChange={(comune) => {
              field.onChange(comune?.id ?? '');
              setValue('destinationFrazioneId', '', { shouldDirty: true });
              if (comune?.province) setValue('destinationProvince', comune.province, { shouldDirty: true });
            }}
            required={isCreate}
            error={!!fieldState.error}
            helperText={
              fieldState.error?.message ??
              (!initialComune && mainDestination?.municipality && field.value === ''
                ? `Attuale: ${mainDestination.municipality}`
                : undefined)
            }
            sx={{ minWidth: 220, flex: '1 1 220px', ...(isHighlighted('destinationComuneId') ? DIRTY_FIELD_SX : {}) }}
          />
        )}
      />
      {frazioni.length > 0 && (
        <FormTextField
          control={control}
          name="destinationFrazioneId"
          label="Frazione"
          width={150}
          highlighted={isHighlighted('destinationFrazioneId')}
          numeric
          select
        >
          <MenuItem value="">Nessuna</MenuItem>
          {frazioni.map((frazione) => (
            <MenuItem key={frazione.id} value={frazione.id}>
              {frazione.name}
            </MenuItem>
          ))}
        </FormTextField>
      )}
    </>
  );
};

interface Props {
  mode: 'create' | 'edit';
  control: Control<CustomerFormValues>;
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<CustomerFormValues>>>;
  setValue: UseFormSetValue<CustomerFormValues>;
  hasMainContact: boolean;
  mainDestination?: CustomerDestination;
}

const CustomerFormFields: React.FC<Props> = ({
  mode,
  control,
  dirtyFields,
  setValue,
  hasMainContact,
  mainDestination,
}) => {
  const { data: typesData } = useCustomerTypes();
  const { data: statusesData } = useCustomerStatuses();
  const { data: relationshipTypesData } = useCustomerRelationshipTypes();
  const activityTypesQuery = useCustomerActivityTypes();
  const paymentConditionsQuery = useCustomerPaymentConditions();
  const agentsQuery = useCustomerAgents();
  const isCreate = mode === 'create';
  // Every field is "changed" on a new customer, so the highlight only makes sense when editing.
  const isHighlighted = (name: keyof CustomerFormValues) => !isCreate && !!dirtyFields[name];

  const textField = (name: FieldName, label: string, width: number, extra?: Partial<FormTextFieldProps>) => (
    <FormTextField
      control={control}
      name={name}
      label={label}
      width={width}
      highlighted={isHighlighted(name)}
      {...extra}
    />
  );

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardHeader title="Dati generali" />
        <CardContent>
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
            {textField('companyName', 'Ragione sociale', 220, { requiredMessage: 'La ragione sociale è obbligatoria' })}
            {textField('companyName2', 'Ragione sociale 2', 220)}
            {textField('vat', 'Partita IVA', 180)}
            {textField('taxCode', 'Codice fiscale', 180)}
            {textField('attentionTo', 'Alla cortese attenzione di', 220)}
            {textField('uniqueCode', 'Codice univoco', 180)}
            {textField('recipientCode', 'Codice destinatario', 180)}
            <Controller
              name="isInsolvent"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  sx={isHighlighted('isInsolvent') ? { backgroundColor: '#fff9c4', borderRadius: 1, px: 1 } : {}}
                  control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Insolvente"
                />
              )}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Informazioni commerciali" />
        <CardContent>
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
            {textField('status', 'Stato cliente', 180, {
              select: true,
              children: [
                <MenuItem key="" value="">
                  N/D
                </MenuItem>,
                ...(statusesData?.statuses ?? []).map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                )),
              ],
            })}
            {textField('customerTypeId', 'Tipo cliente', 180, {
              select: true,
              numeric: true,
              children: [
                <MenuItem key="" value="">
                  N/D
                </MenuItem>,
                ...(typesData?.types ?? []).map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                )),
              ],
            })}
            {textField('website', 'Sito web', 220)}
            {textField('relationshipTypeId', 'Tipo rapporto', 180, {
              select: true,
              numeric: true,
              children: [
                // On a new customer the backend falls back to the Delphi default.
                <MenuItem key="" value="" disabled={!isCreate}>
                  {isCreate ? 'Predefinito' : 'N/D'}
                </MenuItem>,
                ...(relationshipTypesData?.types ?? []).map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                )),
              ],
            })}
            <FormLookupField
              control={control}
              name="activityId"
              label="Attività"
              width={180}
              highlighted={isHighlighted('activityId')}
              options={activityTypesQuery.data?.activities ?? []}
              loading={activityTypesQuery.isLoading}
            />
            <FormLookupField
              control={control}
              name="paymentConditionId"
              label="Condizione pagamento"
              width={220}
              highlighted={isHighlighted('paymentConditionId')}
              options={paymentConditionsQuery.data?.paymentConditions ?? []}
              loading={paymentConditionsQuery.isLoading}
              disableClearable={!isCreate}
            />
            <FormLookupField
              control={control}
              name="agentId"
              label="Agente"
              width={180}
              highlighted={isHighlighted('agentId')}
              options={agentsQuery.data?.agents ?? []}
              loading={agentsQuery.isLoading}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Recapito principale" />
        <CardContent>
          {isCreate || hasMainContact ? (
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
              {textField('contactTitle', 'Titolo', 150)}
              {textField('contactName', 'Riferimento', 200)}
              {textField('contactPhone', 'Telefono', 150)}
              {textField('contactMobilePhone', 'Cellulare', 150)}
              {textField('contactEmail', 'Email', 220)}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nessun contatto principale registrato
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Sede principale" />
        <CardContent>
          {isCreate || mainDestination ? (
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
              <ComuneFields
                control={control}
                setValue={setValue}
                isCreate={isCreate}
                mainDestination={mainDestination}
                isHighlighted={isHighlighted}
              />
              {textField('destinationStreet', 'Indirizzo', 220)}
              {textField('destinationHouseNumber', 'Civico', 110, { numeric: true })}
              {textField('destinationOther', 'Altro', 150)}
              {textField('destinationProvince', 'Provincia', 110)}
              {textField('destinationKm', 'Km', 110, { numeric: true })}
              {textField('destinationMinutes', 'Tempo viaggio (min)', 150, { numeric: true })}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nessuna sede principale registrata
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CustomerFormFields;
