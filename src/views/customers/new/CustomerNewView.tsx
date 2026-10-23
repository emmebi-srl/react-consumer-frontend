import { useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import BackButton from '~/components/Layout/BackButton';
import PageContainer from '~/components/Layout/PageContainer';
import useSnackbar from '~/hooks/useSnackbar';
import { useCreateCustomer, useCustomerStatuses, useCustomerTypes } from '~/proxies/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';
import CustomerFormFields from '../form/CustomerFormFields';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import { CustomerFormValues, getCustomerFormValues, toOptionalNumber } from '../form/customerFormValues';

// Same defaults the Delphi client preselects on a new customer.
const DEFAULT_STATUS_NAME = 'ATTIVO';
const DEFAULT_CUSTOMER_TYPE_ID = 1;

const CustomerNewView = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const createMutation = useCreateCustomer();
  const { data: statusesData } = useCustomerStatuses();
  const { data: typesData } = useCustomerTypes();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { dirtyFields, isSubmitting },
  } = useForm<CustomerFormValues>({ defaultValues: getCustomerFormValues() });

  useEffect(() => {
    const activeStatus = statusesData?.statuses.find((status) => status.name.toUpperCase() === DEFAULT_STATUS_NAME);
    if (activeStatus && getValues('status') === '') setValue('status', activeStatus.id);
  }, [statusesData, getValues, setValue]);

  useEffect(() => {
    const defaultType = typesData?.types.find((type) => type.id === DEFAULT_CUSTOMER_TYPE_ID);
    if (defaultType && getValues('customerTypeId') === '') setValue('customerTypeId', defaultType.id);
  }, [typesData, getValues, setValue]);

  const onSubmit = async (values: CustomerFormValues) => {
    if (values.destinationComuneId === '') return;

    try {
      const result = await createMutation.mutateAsync({
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
        relationshipTypeId: toOptionalNumber(values.relationshipTypeId),
        paymentConditionId: toOptionalNumber(values.paymentConditionId),
        activityId: toOptionalNumber(values.activityId),
        agentId: toOptionalNumber(values.agentId),
        mainContact: {
          title: values.contactTitle,
          name: values.contactName,
          phone: values.contactPhone,
          mobilePhone: values.contactMobilePhone,
          email: values.contactEmail,
        },
        mainDestination: {
          comuneId: values.destinationComuneId,
          frazioneId: toOptionalNumber(values.destinationFrazioneId),
          street: values.destinationStreet,
          houseNumber: toOptionalNumber(values.destinationHouseNumber),
          other: values.destinationOther,
          province: values.destinationProvince,
          km: toOptionalNumber(values.destinationKm),
          minutes: toOptionalNumber(values.destinationMinutes),
        },
      });

      const created = result.customers.at(0);
      snackbar.success('Cliente creato');
      navigate(
        created
          ? RouteConfig.CustomerDetail.buildLink({ customerId: String(created.id) })
          : RouteConfig.CustomerList.buildLink(),
        { replace: true },
      );
    } catch {
      snackbar.error('Non è stato possibile creare il cliente');
    }
  };

  return (
    <PageContainer>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} sx={{ pb: 10 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <BackButton to={RouteConfig.CustomerList.buildLink()} />
          <Typography variant="h4">Nuovo cliente</Typography>
        </Stack>

        <CustomerFormFields
          mode="create"
          control={control}
          dirtyFields={dirtyFields}
          setValue={setValue}
          hasMainContact={false}
        />

        <FormSaveBar
          saving={isSubmitting || createMutation.isPending}
          cancelLabel="Annulla"
          submitLabel="Crea cliente"
          onCancel={() => navigate(RouteConfig.CustomerList.buildLink())}
        />
      </Stack>
    </PageContainer>
  );
};

export default CustomerNewView;
