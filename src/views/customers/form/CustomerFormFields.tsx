import { ReactNode, useState } from 'react';
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
import { Control, Controller, FieldNamesMarkedBoolean, UseFormSetValue } from 'react-hook-form';
import { useCustomerStatuses, useCustomerTypes } from '~/proxies/aries-proxy/customers';
import { useComuneSearch, useFrazioniByComune } from '~/proxies/aries-proxy/geo';
import { Customer, CustomerDestination } from '~/types/aries-proxy/customers';
import { Comune } from '~/types/aries-proxy/geo';
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

interface ComuneFieldsProps {
  control: Control<CustomerFormValues>;
  setValue: UseFormSetValue<CustomerFormValues>;
}

const ComuneFields: React.FC<ComuneFieldsProps> = ({ control, setValue }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedComune, setSelectedComune] = useState<Comune | null>(null);
  const comuneQuery = useComuneSearch(searchText);
  const frazioniQuery = useFrazioniByComune(selectedComune?.id ?? null);
  const frazioni = frazioniQuery.data?.frazioni ?? [];

  return (
    <>
      <Controller
        name="destinationComuneId"
        control={control}
        rules={{ validate: (value) => value !== '' || 'Il comune è obbligatorio' }}
        render={({ field, fieldState }) => (
          <Autocomplete
            options={comuneQuery.data?.comuni ?? []}
            value={selectedComune}
            loading={comuneQuery.isLoading}
            filterOptions={(options) => options}
            getOptionLabel={(option) => `${option.name}${option.province ? ` (${option.province})` : ''}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) => {
              setSelectedComune(value);
              field.onChange(value?.id ?? '');
              setValue('destinationFrazioneId', '');
              if (value?.province) setValue('destinationProvince', value.province);
            }}
            onInputChange={(_event, value, reason) => {
              if (reason !== 'reset') setSearchText(value);
            }}
            sx={{ minWidth: 220, flex: '1 1 220px' }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                size="small"
                label="Comune"
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? 'Digita almeno 2 lettere'}
              />
            )}
          />
        )}
      />
      {frazioni.length > 0 && (
        <FormTextField
          control={control}
          name="destinationFrazioneId"
          label="Frazione"
          width={150}
          highlighted={false}
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
  customer?: Customer;
  hasMainContact: boolean;
  mainDestination?: CustomerDestination;
}

const CustomerFormFields: React.FC<Props> = ({
  mode,
  control,
  dirtyFields,
  setValue,
  customer,
  hasMainContact,
  mainDestination,
}) => {
  const { data: typesData } = useCustomerTypes();
  const { data: statusesData } = useCustomerStatuses();
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
            {customer && (
              <>
                <TextField
                  label="Tipo rapporto"
                  size="small"
                  value={customer.relationshipTypeId ?? 'N/D'}
                  disabled
                  sx={{ minWidth: 150, flex: '1 1 150px' }}
                />
                <TextField
                  label="Attività"
                  size="small"
                  value={customer.activityId ?? 'N/D'}
                  disabled
                  sx={{ minWidth: 150, flex: '1 1 150px' }}
                />
                <TextField
                  label="Condizione pagamento"
                  size="small"
                  value={customer.paymentConditionId ?? 'N/D'}
                  disabled
                  sx={{ minWidth: 150, flex: '1 1 150px' }}
                />
                <TextField
                  label="Agente"
                  size="small"
                  value={customer.agentId ?? 'N/D'}
                  disabled
                  sx={{ minWidth: 150, flex: '1 1 150px' }}
                />
              </>
            )}
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
              {isCreate && <ComuneFields control={control} setValue={setValue} />}
              {textField('destinationStreet', 'Indirizzo', 220)}
              {textField('destinationHouseNumber', 'Civico', 110, { numeric: true })}
              {textField('destinationOther', 'Altro', 150)}
              {textField('destinationProvince', 'Provincia', 110)}
              {mainDestination && (
                <>
                  <TextField
                    label="Comune"
                    size="small"
                    value={mainDestination.municipality || 'N/D'}
                    disabled
                    sx={{ minWidth: 150, flex: '1 1 150px' }}
                  />
                  <TextField
                    label="Frazione"
                    size="small"
                    value={mainDestination.fraction || 'N/D'}
                    disabled
                    sx={{ minWidth: 150, flex: '1 1 150px' }}
                  />
                </>
              )}
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
