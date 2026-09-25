import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DashboardMonthlyStat } from '~/types/aries-proxy/dashboard';
import { formatMoney, newMoney, sumMoney } from '~/utils/money';

interface SummarySeries {
  color: string;
  label: string;
  stackId: string;
  totalDataKey: keyof DashboardMonthlyStat;
  openDataKey: keyof DashboardMonthlyStat;
  openSentDataKey?: keyof DashboardMonthlyStat;
  totalAmountDataKey?: keyof DashboardMonthlyStat;
  openTotalDataKey?: keyof DashboardMonthlyStat;
}

interface Props {
  series: readonly SummarySeries[];
  stats: DashboardMonthlyStat[];
}

const MonthlyStatsSummary = ({ series, stats }: Props) => {
  const sumCount = (key: keyof DashboardMonthlyStat) => stats.reduce((total, month) => total + month[key], 0);
  const sumAmount = (key: keyof DashboardMonthlyStat) =>
    formatMoney(stats.reduce((total, month) => sumMoney(total, newMoney(month[key], 'EUR')), newMoney(0, 'EUR')));

  return (
    <Box
      aria-label="Riepilogo documenti del periodo"
      component="section"
      sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', mb: 3 }}
    >
      {series.map((item) => (
        <Card
          key={item.stackId}
          component="article"
          aria-label={item.label}
          variant="outlined"
          sx={{ bgcolor: alpha(item.color, 0.04), borderTop: 4, borderTopColor: item.color, minWidth: 0 }}
        >
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography color={item.color} fontWeight={700} variant="subtitle1">
              {item.label}
            </Typography>
            <Box>
              <Typography component="p" fontWeight={700} variant="h3">
                {sumCount(item.totalDataKey)}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Documenti nel periodo
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="body2">Aperti</Typography>
                <Typography fontWeight={700} variant="body2">
                  {sumCount(item.openDataKey)}
                </Typography>
              </Stack>
              {item.openSentDataKey ? (
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography color="text.secondary" variant="body2">
                    Di cui inviati
                  </Typography>
                  <Typography fontWeight={700} variant="body2">
                    {sumCount(item.openSentDataKey)}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
            {item.totalAmountDataKey && item.openTotalDataKey ? (
              <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography color="text.secondary" variant="caption">
                  Importo totale
                </Typography>
                <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }} variant="subtitle1">
                  {sumAmount(item.totalAmountDataKey)}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  Importo aperto
                </Typography>
                <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }} variant="body2">
                  {sumAmount(item.openTotalDataKey)}
                </Typography>
              </Box>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MonthlyStatsSummary;
