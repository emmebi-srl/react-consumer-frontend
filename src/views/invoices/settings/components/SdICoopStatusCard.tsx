import { Alert, Card, CardContent, CardHeader, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useSdICoopStatus } from '~/proxies/aries-proxy/invoices';
import { SdICoopCertificate } from '~/types/aries-proxy/invoices';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';

/** Days before the expiry when the renewal must start (new CSR, AdE portal, deploy). */
const WARNING_DAYS = 60;
const URGENT_DAYS = 7;

const RENEWAL_HINT =
  'Rinnovo dal portale SdI, pagina "Gestire il canale": nuove CSR per client e server, poi i nuovi certificati ' +
  'vanno sostituiti nel servizio SDICoop e su nginx (sdi.emmebi.tv.it), che ha la stessa scadenza.';

interface Level {
  label: string;
  color: 'success' | 'warning' | 'error';
}

const getLevel = (certificate: SdICoopCertificate): Level => {
  if (certificate.daysToExpiry < 0) return { label: 'Scaduto', color: 'error' };
  if (certificate.daysToExpiry <= URGENT_DAYS) return { label: 'In scadenza', color: 'error' };
  if (certificate.daysToExpiry <= WARNING_DAYS) return { label: 'In scadenza', color: 'warning' };
  return { label: 'Valido', color: 'success' };
};

const getCommonName = (subject: string) => /CN=([^,]+)/.exec(subject)?.[1] ?? subject;

const getExpiryText = (days: number) => {
  if (days < 0) return `scaduto da ${-days} ${-days === 1 ? 'giorno' : 'giorni'}`;
  if (days === 0) return 'scade oggi';
  return `scade tra ${days} ${days === 1 ? 'giorno' : 'giorni'}`;
};

/**
 * SDICoop channel of the installation: is SdICoopService running, and until when the certificate
 * issued by the Agenzia delle Entrate is valid. Read only: certificates are replaced with a deploy.
 * Hidden for installations without a SDICoop channel.
 */
const SdICoopStatusCard = () => {
  const statusQuery = useSdICoopStatus();
  const status = statusQuery.data;

  if (status && !status.enabled) return null;

  const certificate = status?.serviceAvailable ? status.clientCertificate : null;
  const level = certificate ? getLevel(certificate) : null;

  return (
    <Card variant="outlined">
      <CardHeader
        title="Canale SDICoop"
        titleTypographyProps={{ variant: 'subtitle1' }}
        action={
          level ? (
            <Chip size="small" label={level.label} color={level.color} />
          ) : status && !status.serviceAvailable ? (
            <Chip size="small" label="Non attivo" color="error" />
          ) : null
        }
      />
      <CardContent>
        {statusQuery.isError ? (
          <Alert severity="warning">
            {getApiErrorMessage(statusQuery.error, 'Stato del canale SDICoop non disponibile.')}
          </Alert>
        ) : !status ? (
          <CircularProgress size={24} />
        ) : !status.serviceAvailable ? (
          <Alert severity="error">{status.message || 'Il servizio SDICoop non risponde.'}</Alert>
        ) : certificate && level ? (
          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                Certificato client <strong>{getCommonName(certificate.subject)}</strong>, rilasciato da{' '}
                {getCommonName(certificate.issuer)}
              </Typography>
              <Typography variant="body2">
                Valido dal {getStringDateByUnixtimestamp(certificate.validFrom)} al{' '}
                <strong>{getStringDateByUnixtimestamp(certificate.validTo)}</strong> (
                {getExpiryText(certificate.daysToExpiry)})
              </Typography>
            </Stack>
            {level.color === 'success' ? (
              <Typography variant="caption" color="text.secondary">
                {RENEWAL_HINT}
              </Typography>
            ) : (
              <Alert severity={level.color}>
                {certificate.daysToExpiry < 0
                  ? 'Il certificato è scaduto: non è possibile inviare fatture né ricevere quelle dei fornitori. '
                  : 'Il certificato sta per scadere: avviare subito il rinnovo. '}
                {RENEWAL_HINT}
              </Alert>
            )}
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default SdICoopStatusCard;
