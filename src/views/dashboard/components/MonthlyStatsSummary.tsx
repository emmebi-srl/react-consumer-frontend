import BigNumber from 'bignumber.js';
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
  openSentLabel?: string;
  openSentName?: string;
  openUnsentName?: string;
  openSentTotalDataKey?: keyof DashboardMonthlyStat;
  openUnsentLabel?: string;
  totalAmountDataKey?: keyof DashboardMonthlyStat;
  openTotalDataKey?: keyof DashboardMonthlyStat;
}

interface Props {
  series: readonly SummarySeries[];
  stats: DashboardMonthlyStat[];
}

const MonthlyStatsSummary = ({ series, stats }: Props) => {
  const sumCount = (key: keyof DashboardMonthlyStat) => stats.reduce((total, month) => total + month[key], 0);
  const sumAmountMoney = (key: keyof DashboardMonthlyStat) =>
    stats.reduce((total, month) => sumMoney(total, newMoney(month[key], 'EUR')), newMoney(0, 'EUR'));
  const sumAmount = (key: keyof DashboardMonthlyStat) => formatMoney(sumAmountMoney(key));
  const subtractAmount = (totalKey: keyof DashboardMonthlyStat, partKey: keyof DashboardMonthlyStat) =>
    formatMoney(
      newMoney(BigNumber(sumAmountMoney(totalKey).amount).minus(sumAmountMoney(partKey).amount).toString(), 'EUR'),
    );

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
            <Typography
              color={item.color}
              variant="subtitle1"
              sx={{
                fontWeight: 700,
              }}
            >
              {item.label}
            </Typography>
            <Box>
              <Typography
                component="p"
                variant="h3"
                sx={{
                  fontWeight: 700,
                }}
              >
                {sumCount(item.totalDataKey)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                Documenti nel periodo
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2">Aperti</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {sumCount(item.openDataKey)}
                </Typography>
              </Stack>
              {item.openSentDataKey ? (
                <>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: 'space-between',
                      pl: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {item.openSentName ?? `Di cui ${item.openSentLabel ?? 'inviati'}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {sumCount(item.openSentDataKey)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: 'space-between',
                      pl: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {item.openUnsentName ?? `Di cui ${item.openUnsentLabel ?? 'non inviati'}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {sumCount(item.openDataKey) - sumCount(item.openSentDataKey)}
                    </Typography>
                  </Stack>
                </>
              ) : null}
            </Stack>
            {item.totalAmountDataKey && item.openTotalDataKey ? (
              <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Importo totale
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {sumAmount(item.totalAmountDataKey)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Importo aperto
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {sumAmount(item.openTotalDataKey)}
                </Typography>
                {item.openSentTotalDataKey ? (
                  <Box sx={{ mt: 0.5, pl: 1.5 }}>
                    <Typography
                      component="p"
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {item.openSentName ?? `Di cui ${item.openSentLabel ?? 'inviati'}`}:{' '}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {sumAmount(item.openSentTotalDataKey)}
                      </Typography>
                    </Typography>
                    <Typography
                      component="p"
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {item.openUnsentName ?? `Di cui ${item.openUnsentLabel ?? 'non inviati'}`}:{' '}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {subtractAmount(item.openTotalDataKey, item.openSentTotalDataKey)}
                      </Typography>
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MonthlyStatsSummary;
