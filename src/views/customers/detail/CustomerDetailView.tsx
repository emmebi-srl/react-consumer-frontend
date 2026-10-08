import {
  Box,
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
import { useParams, Link as RouterLink } from 'react-router-dom';
import PageContainer from '~/components/Layout/PageContainer';
import { useCustomerById, useCustomerTypes } from '~/proxies/aries-proxy/customers';
import { RouteConfig } from '~/routes/routeConfig';
import CustomerStatusChip from '../components/CustomerStatusChip';
import { getMainContact, getMainDestination } from '../customerHelpers';

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ minWidth: 180, flex: '1 1 220px' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2">{value || value === 0 ? value : 'N/D'}</Typography>
  </Box>
);

const CustomerDetailView = () => {
  const params = useParams<{ customerId?: string }>();
  const customerId = Number(params.customerId);

  const customerQuery = useCustomerById(customerId, { includes: 'contacts,destinations' });
  const customer = customerQuery.data?.customers.at(0);
  const { data: typesData } = useCustomerTypes();

  const mainDestination = customer ? getMainDestination(customer) : undefined;
  const mainContact = customer ? getMainContact(customer) : undefined;
  const customerTypeName = typesData?.types.find((type) => type.id === customer?.customerTypeId)?.name;

  return (
    <PageContainer>
      <Stack spacing={3}>
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
                  <DetailField label="ID" value={customer.id} />
                  <DetailField label="Ragione sociale" value={customer.companyName} />
                  <DetailField label="Ragione sociale 2" value={customer.companyName2} />
                  <DetailField label="Partita IVA" value={customer.vat} />
                  <DetailField label="Codice fiscale" value={customer.taxCode} />
                  <DetailField label="Alla cortese attenzione di" value={customer.attentionTo} />
                  <DetailField label="Codice univoco" value={customer.uniqueCode} />
                  <DetailField label="Codice destinatario" value={customer.recipientCode} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Sede principale" />
              <CardContent>
                {mainDestination ? (
                  <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <DetailField
                      label="Indirizzo"
                      value={`${mainDestination.street} ${mainDestination.houseNumber}`.trim()}
                    />
                    <DetailField label="Altro" value={mainDestination.other} />
                    <DetailField label="CAP" value={mainDestination.postalCode} />
                    <DetailField label="Comune" value={mainDestination.municipality} />
                    <DetailField label="Frazione" value={mainDestination.fraction} />
                    <DetailField label="Provincia" value={mainDestination.province} />
                    <DetailField label="Km" value={mainDestination.km} />
                    <DetailField label="Tempo viaggio (min)" value={mainDestination.minutes} />
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nessuna sede principale registrata
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Recapito principale" />
              <CardContent>
                <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <DetailField label="Riferimento" value={mainContact?.name} />
                  <DetailField label="Telefono" value={mainContact?.phone} />
                  <DetailField label="Cellulare" value={mainContact?.mobilePhone} />
                  <DetailField label="Email" value={mainContact?.email} />
                  <DetailField label="Sito web" value={customer.website} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Informazioni commerciali" />
              <CardContent>
                <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <DetailField label="Tipo cliente" value={customerTypeName ?? customer.customerTypeId} />
                  <DetailField label="Tipo rapporto" value={customer.relationshipTypeId} />
                  <DetailField label="Attività" value={customer.activityId} />
                  <DetailField label="Condizione pagamento" value={customer.paymentConditionId} />
                  <DetailField label="Agente" value={customer.agentId} />
                  <DetailField label="Abbonamento" value={customer.subscriptionId} />
                </Stack>
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
      </Stack>
    </PageContainer>
  );
};

export default CustomerDetailView;
