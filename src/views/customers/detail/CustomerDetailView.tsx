import { useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useParams, Link as RouterLink } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import { useModal } from '~/modals/Modal';
import {
  useCustomerById,
  useUpdateCustomer,
  useUpdateCustomerMainContact,
  useUpdateCustomerMainDestination,
} from '~/proxies/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';
import CustomerContactCreateModal from '../components/CustomerContactCreateModal';
import CustomerContactRowActions from '../components/CustomerContactRowActions';
import CustomerDestinationCreateModal from '../components/CustomerDestinationCreateModal';
import CustomerDestinationRowActions from '../components/CustomerDestinationRowActions';
import CustomerStatusChip from '../components/CustomerStatusChip';
import { getMainContact, getMainDestination } from '../customerHelpers';
import CustomerFormFields from '../form/CustomerFormFields';
import CustomerFormSaveBar from '../form/CustomerFormSaveBar';
import { CustomerFormValues, getCustomerFormValues, toOptionalNumber } from '../form/customerFormValues';

const CustomerDetailView = () => {
  const params = useParams<{ customerId?: string }>();
  const customerId = Number(params.customerId);

  const customerQuery = useCustomerById(customerId, { includes: 'contacts,destinations,status' });
  const customer = customerQuery.data?.customers.at(0);

  const updateCustomerMutation = useUpdateCustomer();
  const updateMainContactMutation = useUpdateCustomerMainContact();
  const updateMainDestinationMutation = useUpdateCustomerMainDestination();
  const modal = useModal();

  const mainDestination = customer ? getMainDestination(customer) : undefined;
  const mainContact = customer ? getMainContact(customer) : undefined;

  const defaultValues = useMemo(
    () => getCustomerFormValues(customer, mainContact, mainDestination),
    [customer, mainContact, mainDestination],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
            customerTypeId: toOptionalNumber(values.customerTypeId),
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
            houseNumber: toOptionalNumber(values.destinationHouseNumber),
            other: values.destinationOther,
            province: values.destinationProvince,
            km: toOptionalNumber(values.destinationKm),
            minutes: toOptionalNumber(values.destinationMinutes),
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
            {customer && <CustomerStatusChip statusId={customer.status} status={customer.customerStatus} />}
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
            <CustomerFormFields
              mode="edit"
              control={control}
              dirtyFields={dirtyFields}
              setValue={setValue}
              customer={customer}
              hasMainContact={!!mainContact}
              mainDestination={mainDestination}
            />

            <Card variant="outlined">
              <CardHeader
                title="Destinazioni"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      modal.showModal({
                        component: CustomerDestinationCreateModal,
                        props: { customerId: customer.id },
                      })
                    }
                  >
                    Aggiungi destinazione
                  </Button>
                }
              />
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
                        <TableCell align="right" />
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
                            <CustomerDestinationRowActions customerId={customer.id} destination={destination} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Contatti / Riferimenti"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      modal.showModal({
                        component: CustomerContactCreateModal,
                        props: { customerId: customer.id },
                      })
                    }
                  >
                    Aggiungi contatto
                  </Button>
                }
              />
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
                        <TableCell align="right" />
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
                            <CustomerContactRowActions customerId={customer.id} contact={contact} />
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
          <CustomerFormSaveBar
            saving={isSaving}
            cancelLabel="Annulla modifiche"
            submitLabel="Salva modifiche"
            onCancel={() => reset(defaultValues)}
          />
        )}
      </Stack>
    </PageContainer>
  );
};

export default CustomerDetailView;
