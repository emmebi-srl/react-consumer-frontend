import { useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useParams, Link as RouterLink } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import {
  useCustomerById,
  useCustomerStatuses,
  useCustomerTypes,
  useUpdateCustomer,
  useUpdateCustomerMainContact,
  useUpdateCustomerMainDestination,
} from '~/proxies/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';
import CustomerStatusChip from '../components/CustomerStatusChip';
import { getMainContact, getMainDestination } from '../customerHelpers';

const DIRTY_FIELD_SX = { '& .MuiInputBase-root': { backgroundColor: '#fff9c4' } };

interface CustomerFormValues {
  companyName: string;
  companyName2: string;
  vat: string;
  taxCode: string;
  attentionTo: string;
  status: string;
  customerTypeId: number | '';
  website: string;
  isInsolvent: boolean;
  uniqueCode: string;
  recipientCode: string;
  contactTitle: string;
  contactName: string;
  contactPhone: string;
  contactMobilePhone: string;
  contactEmail: string;
  destinationStreet: string;
  destinationHouseNumber: number | '';
  destinationOther: string;
  destinationProvince: string;
  destinationKm: number | '';
  destinationMinutes: number | '';
}

const CustomerDetailView = () => {
  const params = useParams<{ customerId?: string }>();
  const customerId = Number(params.customerId);

  const customerQuery = useCustomerById(customerId, { includes: 'contacts,destinations' });
  const customer = customerQuery.data?.customers.at(0);
  const { data: typesData } = useCustomerTypes();
  const { data: statusesData } = useCustomerStatuses();

  const updateCustomerMutation = useUpdateCustomer();
  const updateMainContactMutation = useUpdateCustomerMainContact();
  const updateMainDestinationMutation = useUpdateCustomerMainDestination();

  const mainDestination = customer ? getMainDestination(customer) : undefined;
  const mainContact = customer ? getMainContact(customer) : undefined;

  const defaultValues = useMemo<CustomerFormValues>(
    () => ({
      companyName: customer?.companyName ?? '',
      companyName2: customer?.companyName2 ?? '',
      vat: customer?.vat ?? '',
      taxCode: customer?.taxCode ?? '',
      attentionTo: customer?.attentionTo ?? '',
      status: customer?.status ?? '',
      customerTypeId: customer?.customerTypeId ?? '',
      website: customer?.website ?? '',
      isInsolvent: customer?.isInsolvent ?? false,
      uniqueCode: customer?.uniqueCode ?? '',
      recipientCode: customer?.recipientCode ?? '',
      contactTitle: mainContact?.title ?? '',
      contactName: mainContact?.name ?? '',
      contactPhone: mainContact?.phone ?? '',
      contactMobilePhone: mainContact?.mobilePhone ?? '',
      contactEmail: mainContact?.email ?? '',
      destinationStreet: mainDestination?.street ?? '',
      destinationHouseNumber: mainDestination?.houseNumber ?? '',
      destinationOther: mainDestination?.other ?? '',
      destinationProvince: mainDestination?.province ?? '',
      destinationKm: mainDestination?.km ?? '',
      destinationMinutes: mainDestination?.minutes ?? '',
    }),
    [customer, mainContact, mainDestination],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isDirty, isSubmitting },
  } = useForm<CustomerFormValues>({ values: defaultValues, resetOptions: { keepDirtyValues: true } });

  // Reset the "keep dirty on reload" baseline once the initial data has arrived.
  useEffect(() => {
    if (customer) reset(defaultValues, { keepDirtyValues: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  const onSubmit = async (values: CustomerFormValues) => {
    if (!customer) return;

    const tasks: Promise<unknown>[] = [];

    const customerDirty =
      dirtyFields.companyName ||
      dirtyFields.companyName2 ||
      dirtyFields.vat ||
      dirtyFields.taxCode ||
      dirtyFields.attentionTo ||
      dirtyFields.status ||
      dirtyFields.customerTypeId ||
      dirtyFields.website ||
      dirtyFields.isInsolvent ||
      dirtyFields.uniqueCode ||
      dirtyFields.recipientCode;

    if (customerDirty) {
      tasks.push(
        updateCustomerMutation.mutateAsync({
          id: customer.id,
          data: {
            companyName: values.companyName,
            companyName2: values.companyName2,
            vat: values.vat,
            taxCode: values.taxCode,
            attentionTo: values.attentionTo,
            status: values.status,
            customerTypeId: values.customerTypeId === '' ? undefined : values.customerTypeId,
            website: values.website,
            isInsolvent: values.isInsolvent,
            uniqueCode: values.uniqueCode,
            recipientCode: values.recipientCode,
          },
        }),
      );
    }

    const contactDirty =
      mainContact &&
      (dirtyFields.contactTitle ||
        dirtyFields.contactName ||
        dirtyFields.contactPhone ||
        dirtyFields.contactMobilePhone ||
        dirtyFields.contactEmail);

    if (contactDirty) {
      tasks.push(
        updateMainContactMutation.mutateAsync({
          customerId: customer.id,
          data: {
            title: values.contactTitle,
            name: values.contactName,
            phone: values.contactPhone,
            mobilePhone: values.contactMobilePhone,
            email: values.contactEmail,
          },
        }),
      );
    }

    const destinationDirty =
      mainDestination &&
      (dirtyFields.destinationStreet ||
        dirtyFields.destinationHouseNumber ||
        dirtyFields.destinationOther ||
        dirtyFields.destinationProvince ||
        dirtyFields.destinationKm ||
        dirtyFields.destinationMinutes);

    if (destinationDirty) {
      tasks.push(
        updateMainDestinationMutation.mutateAsync({
          customerId: customer.id,
          data: {
            street: values.destinationStreet,
            houseNumber: values.destinationHouseNumber === '' ? undefined : values.destinationHouseNumber,
            other: values.destinationOther,
            province: values.destinationProvince,
            km: values.destinationKm === '' ? undefined : values.destinationKm,
            minutes: values.destinationMinutes === '' ? undefined : values.destinationMinutes,
          },
        }),
      );
    }

    await Promise.all(tasks);
  };

  const isSaving =
    isSubmitting ||
    updateCustomerMutation.isPending ||
    updateMainContactMutation.isPending ||
    updateMainDestinationMutation.isPending;

  return (
    <PageContainer>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} sx={{ pb: isDirty ? 10 : 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h4">{customer ? customer.companyName : `Cliente #${customerId}`}</Typography>
            {customer && <CustomerStatusChip statusId={customer.status} />}
            {customer?.isInsolvent && <Chip size="small" color="error" label="Insolvente" />}
          </Stack>
          <Typography
            component={RouterLink}
            to={RouteConfig.CustomerList.buildLink()}
            color="primary"
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            {'←'} Torna alla lista
          </Typography>
        </Stack>

        {customer && (
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardHeader title="Dati generali" />
              <CardContent>
                <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ragione sociale"
                        size="small"
                        sx={{ minWidth: 220, flex: '1 1 220px', ...(dirtyFields.companyName ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="companyName2"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ragione sociale 2"
                        size="small"
                        sx={{ minWidth: 220, flex: '1 1 220px', ...(dirtyFields.companyName2 ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="vat"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Partita IVA"
                        size="small"
                        sx={{ minWidth: 180, flex: '1 1 180px', ...(dirtyFields.vat ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="taxCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Codice fiscale"
                        size="small"
                        sx={{ minWidth: 180, flex: '1 1 180px', ...(dirtyFields.taxCode ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="attentionTo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Alla cortese attenzione di"
                        size="small"
                        sx={{ minWidth: 220, flex: '1 1 220px', ...(dirtyFields.attentionTo ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="uniqueCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Codice univoco"
                        size="small"
                        sx={{ minWidth: 180, flex: '1 1 180px', ...(dirtyFields.uniqueCode ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="recipientCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Codice destinatario"
                        size="small"
                        sx={{ minWidth: 180, flex: '1 1 180px', ...(dirtyFields.recipientCode ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
                  <Controller
                    name="isInsolvent"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{
                          ...(dirtyFields.isInsolvent ? { backgroundColor: '#fff9c4', borderRadius: 1, px: 1 } : {}),
                        }}
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
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Stato cliente"
                        size="small"
                        sx={{ minWidth: 180, flex: '1 1 180px', ...(dirtyFields.status ? DIRTY_FIELD_SX : {}) }}
                      >
                        <MenuItem value="">N/D</MenuItem>
                        {(statusesData?.statuses ?? []).map((status) => (
                          <MenuItem key={status.id} value={status.id}>
                            {status.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="customerTypeId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Tipo cliente"
                        size="small"
                        sx={{ minWidth: 180, flex: '1 1 180px', ...(dirtyFields.customerTypeId ? DIRTY_FIELD_SX : {}) }}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      >
                        <MenuItem value="">N/D</MenuItem>
                        {(typesData?.types ?? []).map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Sito web"
                        size="small"
                        sx={{ minWidth: 220, flex: '1 1 220px', ...(dirtyFields.website ? DIRTY_FIELD_SX : {}) }}
                      />
                    )}
                  />
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
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Recapito principale" />
              <CardContent>
                {mainContact ? (
                  <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <Controller
                      name="contactTitle"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Titolo"
                          size="small"
                          sx={{ minWidth: 150, flex: '1 1 150px', ...(dirtyFields.contactTitle ? DIRTY_FIELD_SX : {}) }}
                        />
                      )}
                    />
                    <Controller
                      name="contactName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Riferimento"
                          size="small"
                          sx={{ minWidth: 200, flex: '1 1 200px', ...(dirtyFields.contactName ? DIRTY_FIELD_SX : {}) }}
                        />
                      )}
                    />
                    <Controller
                      name="contactPhone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Telefono"
                          size="small"
                          sx={{ minWidth: 150, flex: '1 1 150px', ...(dirtyFields.contactPhone ? DIRTY_FIELD_SX : {}) }}
                        />
                      )}
                    />
                    <Controller
                      name="contactMobilePhone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Cellulare"
                          size="small"
                          sx={{
                            minWidth: 150,
                            flex: '1 1 150px',
                            ...(dirtyFields.contactMobilePhone ? DIRTY_FIELD_SX : {}),
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="contactEmail"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email"
                          size="small"
                          sx={{ minWidth: 220, flex: '1 1 220px', ...(dirtyFields.contactEmail ? DIRTY_FIELD_SX : {}) }}
                        />
                      )}
                    />
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
                {mainDestination ? (
                  <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <Controller
                      name="destinationStreet"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Indirizzo"
                          size="small"
                          sx={{
                            minWidth: 220,
                            flex: '1 1 220px',
                            ...(dirtyFields.destinationStreet ? DIRTY_FIELD_SX : {}),
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="destinationHouseNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Civico"
                          type="number"
                          size="small"
                          sx={{
                            minWidth: 110,
                            flex: '1 1 110px',
                            ...(dirtyFields.destinationHouseNumber ? DIRTY_FIELD_SX : {}),
                          }}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      )}
                    />
                    <Controller
                      name="destinationOther"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Altro"
                          size="small"
                          sx={{
                            minWidth: 150,
                            flex: '1 1 150px',
                            ...(dirtyFields.destinationOther ? DIRTY_FIELD_SX : {}),
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="destinationProvince"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Provincia"
                          size="small"
                          sx={{
                            minWidth: 110,
                            flex: '1 1 110px',
                            ...(dirtyFields.destinationProvince ? DIRTY_FIELD_SX : {}),
                          }}
                        />
                      )}
                    />
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
                    <Controller
                      name="destinationKm"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Km"
                          type="number"
                          size="small"
                          sx={{
                            minWidth: 110,
                            flex: '1 1 110px',
                            ...(dirtyFields.destinationKm ? DIRTY_FIELD_SX : {}),
                          }}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      )}
                    />
                    <Controller
                      name="destinationMinutes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Tempo viaggio (min)"
                          type="number"
                          size="small"
                          sx={{
                            minWidth: 150,
                            flex: '1 1 150px',
                            ...(dirtyFields.destinationMinutes ? DIRTY_FIELD_SX : {}),
                          }}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      )}
                    />
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nessuna sede principale registrata
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Destinazioni" />
              <CardContent>
                {(customer.destinations ?? []).length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nessuna destinazione registrata
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Indirizzo</TableCell>
                        <TableCell>Comune</TableCell>
                        <TableCell>Provincia</TableCell>
                        <TableCell align="right">Km</TableCell>
                        <TableCell align="right">Tempo (min)</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(customer.destinations ?? []).map((destination) => (
                        <TableRow key={destination.destinationId}>
                          <TableCell>{`${destination.street} ${destination.houseNumber}`.trim() || 'N/D'}</TableCell>
                          <TableCell>{destination.municipality}</TableCell>
                          <TableCell>{destination.province}</TableCell>
                          <TableCell align="right">{destination.km}</TableCell>
                          <TableCell align="right">{destination.minutes}</TableCell>
                          <TableCell align="right">
                            {destination.mainDestination && <Chip size="small" label="Principale" color="primary" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Contatti / Riferimenti" />
              <CardContent>
                {(customer.contacts ?? []).length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nessun contatto registrato
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Figura</TableCell>
                        <TableCell>Telefono</TableCell>
                        <TableCell>Cellulare</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(customer.contacts ?? []).map((contact) => (
                        <TableRow key={contact.contactId}>
                          <TableCell>{[contact.title, contact.name].filter(Boolean).join(' ')}</TableCell>
                          <TableCell>{contact.figure}</TableCell>
                          <TableCell>{contact.phone}</TableCell>
                          <TableCell>{contact.mobilePhone}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell align="right">
                            {contact.isMain && <Chip size="small" label="Principale" color="primary" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}

        {isDirty && (
          <Paper
            elevation={4}
            sx={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              zIndex: 10,
            }}
          >
            <Button variant="outlined" disabled={isSaving} onClick={() => reset(defaultValues)}>
              Annulla modifiche
            </Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? 'Salvataggio…' : 'Salva modifiche'}
            </Button>
          </Paper>
        )}
      </Stack>
    </PageContainer>
  );
};

export default CustomerDetailView;
