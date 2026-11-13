import { Alert, CircularProgress, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useCampaignTypeCustomerTypes, useSaveCampaignTypeCustomerType } from '~/proxies/aries-proxy/campaigns';
import { useCustomerTypes } from '~/proxies/aries-proxy/customers';
import { CampaignType } from '~/types/aries-proxy/campaigns';
import { getApiErrorMessage } from '~/utils/api-error-utils';

/**
 * Settings of the campaign type per customer type: today only WhatsApp on/off. They belong to the type, so
 * they apply to every campaign of that type. A customer type without a row uses the defaults (WhatsApp on).
 */
const CampaignTypeCustomerTypeSettings: React.FC<{ campaignType: CampaignType }> = ({ campaignType }) => {
  const customerTypesQuery = useCustomerTypes();
  const settingsQuery = useCampaignTypeCustomerTypes({ campaignTypeId: campaignType.id });
  const save = useSaveCampaignTypeCustomerType();

  const settings = settingsQuery.data?.campaignTypeCustomerTypes ?? [];
  const isWhatsappEnabled = (customerTypeId: number) =>
    settings.find((item) => item.customerTypeId === customerTypeId)?.isWhatsappEnabled ?? true;

  const isLoading = customerTypesQuery.isLoading || settingsQuery.isLoading;

  return (
    <Stack direction="column" sx={{ gap: 1 }}>
      <Typography variant="subtitle1">WhatsApp per tipo cliente</Typography>
      <Typography variant="body2" color="text.secondary">
        {`Vale per tutte le campagne di tipo "${campaignType.name}". Ai tipi cliente disattivati arriva solo l'email. Gli invii già creati non cambiano.`}
      </Typography>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        (customerTypesQuery.data?.types ?? []).map((customerType) => (
          <FormControlLabel
            key={customerType.id}
            label={customerType.name}
            control={
              <Switch
                checked={isWhatsappEnabled(customerType.id)}
                disabled={save.isPending}
                onChange={(event) =>
                  save.mutate({
                    campaignTypeId: campaignType.id,
                    customerTypeId: customerType.id,
                    isWhatsappEnabled: event.target.checked,
                  })
                }
              />
            }
          />
        ))
      )}
      {save.error && (
        <Alert severity="error">{getApiErrorMessage(save.error, 'Impossibile salvare l’impostazione WhatsApp.')}</Alert>
      )}
    </Stack>
  );
};

export default CampaignTypeCustomerTypeSettings;
