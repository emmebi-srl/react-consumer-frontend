import { Chip, Divider, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import { useCustomerById } from '~/proxies/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';

const CustomerDetailView = () => {
  const params = useParams<{ customerId?: string }>();
  const customerId = Number(params.customerId);

  const customerQuery = useCustomerById(customerId, { includes: 'contacts,destinations' });
  const customer = customerQuery.data?.customers.at(0);

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h4">{customer ? customer.companyName : `Cliente #${customerId}`}</Typography>
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
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Chip label={`Stato: ${customer.status ?? 'N/D'}`} />
              <Chip label={`Tipo cliente: ${customer.customerTypeId ?? 'N/D'}`} />
              {customer.isInsolvent && <Chip color="error" label="Insolvente" />}
            </Stack>

            <Divider />

            <Typography variant="h6">Dati generali</Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Ragione sociale:</strong> {customer.companyName}
              </Typography>
              {customer.companyName2 && (
                <Typography variant="body2">
                  <strong>Ragione sociale alternativa:</strong> {customer.companyName2}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Partita IVA:</strong> {customer.vat || 'N/D'}
              </Typography>
              <Typography variant="body2">
                <strong>Codice fiscale:</strong> {customer.taxCode || 'N/D'}
              </Typography>
              {customer.attentionTo && (
                <Typography variant="body2">
                  <strong>Alla cortese attenzione di:</strong> {customer.attentionTo}
                </Typography>
              )}
              {customer.website && (
                <Typography variant="body2">
                  <strong>Sito web:</strong> {customer.website}
                </Typography>
              )}
              {customer.uniqueCode && (
                <Typography variant="body2">
                  <strong>Codice univoco:</strong> {customer.uniqueCode}
                </Typography>
              )}
              {customer.recipientCode && (
                <Typography variant="body2">
                  <strong>Codice destinatario:</strong> {customer.recipientCode}
                </Typography>
              )}
            </Stack>

            <Divider />

            <Typography variant="h6">Contatti</Typography>
            {(customer.contacts ?? []).length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Nessun contatto registrato
              </Typography>
            )}
            <List dense>
              {(customer.contacts ?? []).map((contact) => (
                <ListItem key={contact.contactId} disableGutters>
                  <ListItemText
                    primary={[contact.title, contact.name].filter(Boolean).join(' ')}
                    secondary={[contact.figure, contact.phone, contact.mobilePhone, contact.email]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                </ListItem>
              ))}
            </List>

            <Divider />

            <Typography variant="h6">Destinazioni</Typography>
            {(customer.destinations ?? []).length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Nessuna destinazione registrata
              </Typography>
            )}
            <List dense>
              {(customer.destinations ?? []).map((destination) => (
                <ListItem key={destination.destinationId} disableGutters>
                  <ListItemText
                    primary={`${destination.street} ${destination.houseNumber}`.trim() || 'N/D'}
                    secondary={[destination.municipality, destination.province, destination.postalCode]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}
      </Stack>
    </PageContainer>
  );
};

export default CustomerDetailView;
