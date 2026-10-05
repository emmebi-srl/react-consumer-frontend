import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TimelineTypeOption } from '~/components/Timeline';
import { DashboardTimelineItem } from '~/types/aries-proxy/dashboard';
import { formatMoney, newMoney, sumMoney } from '~/utils/money';

interface Props {
  items: DashboardTimelineItem[];
  typeOptions: TimelineTypeOption<DashboardTimelineItem['type']>[];
}

const typesWithAmount: DashboardTimelineItem['type'][] = ['periodic-check'];

const DeadlineTimelineSummary = ({ items, typeOptions }: Props) => (
  <Box
    aria-label="Riepilogo scadenze del periodo"
    component="section"
    sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', mb: 3 }}
  >
    {typeOptions.map((option) => {
      const typeItems = items.filter((item) => item.type === option.key);
      const openItems = typeItems.filter((item) => item.isOpen);
      const hasAmount = typesWithAmount.includes(option.key);
      const pricedOpenItems = openItems.filter((item) => typeof item.amount === 'number');
      const openAmount = pricedOpenItems.reduce(
        (total, item) => sumMoney(total, newMoney(item.amount ?? 0, 'EUR')),
        newMoney(0, 'EUR'),
      );
      const Icon = option.icon;

      return (
        <Card
          key={option.key}
          component="article"
          aria-label={option.label}
          variant="outlined"
          sx={{ bgcolor: alpha(option.color, 0.04), borderTop: 4, borderTopColor: option.color, minWidth: 0 }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Icon fontSize="small" sx={{ color: option.color }} />
              <Typography color={option.color} fontWeight={700} variant="subtitle1">
                {option.label}
              </Typography>
            </Stack>
            <Box>
              <Typography component="p" fontWeight={700} variant="h3">
                {typeItems.length}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Scadenze nel periodo
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="body2">Aperte</Typography>
                <Typography fontWeight={700} variant="body2">
                  {openItems.length}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="body2">Chiuse</Typography>
                <Typography fontWeight={700} variant="body2">
                  {typeItems.length - openItems.length}
                </Typography>
              </Stack>
            </Stack>
            {hasAmount ? (
              <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography color="text.secondary" variant="caption">
                  Importo aperto
                </Typography>
                <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }} variant="subtitle1">
                  {formatMoney(openAmount)}
                </Typography>
                {pricedOpenItems.length < openItems.length ? (
                  <Typography color="text.secondary" variant="caption">
                    {openItems.length - pricedOpenItems.length} senza importo
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </CardContent>
        </Card>
      );
    })}
  </Box>
);

export default DeadlineTimelineSummary;
