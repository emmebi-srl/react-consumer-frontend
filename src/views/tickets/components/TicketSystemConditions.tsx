import { Box, Chip, Stack, Typography } from '@mui/material';
import { TicketSystemConditions as Conditions } from '~/types/aries-proxy/tickets';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, newMoney } from '~/utils/money';

const toEuro = (amount: number) => formatMoney(newMoney(amount, 'EUR'));

const Value: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

/** "Impianto" box of the Delphi ticket form: subscription of the year, call prices and periodic checks. */
const TicketSystemConditions: React.FC<{ conditions: Conditions }> = ({ conditions }) => (
  <Stack spacing={1.5}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
      {conditions.subscriptionName ? (
        <Chip size="small" color="primary" variant="outlined" label={conditions.subscriptionName} />
      ) : (
        <Chip size="small" color="error" label="NON ABBONATO" />
      )}
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Anno {conditions.year}
      </Typography>
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
      <Value label="Diritto di chiamata" value={toEuro(conditions.callRightAmount)} />
      <Value label="Prima ora" value={toEuro(conditions.firstHourAmount)} />
      <Value label="Manutenzione" value={toEuro(conditions.maintenanceAmount)} />
      <Value
        label="Controlli periodici"
        value={
          conditions.periodicChecks
            ? `${conditions.periodicChecksDone}/${conditions.periodicChecks} eseguiti${
                conditions.nextPeriodicCheckDate
                  ? ` · prossimo ${getStringDateByUnixtimestamp(conditions.nextPeriodicCheckDate)}`
                  : ''
              }`
            : 'Nessuno'
        }
      />
    </Box>
  </Stack>
);

export default TicketSystemConditions;
