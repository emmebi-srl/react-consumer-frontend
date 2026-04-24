import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DateRangePicker, { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import { DashboardMonthlyCashflowStat } from '~/types/aries-proxy/dashboard';
import { formatMoney, formatMoneyShort, newMoney } from '~/utils/money';

const series = [
  {
    color: '#0F766E',
    label: 'Pagamenti fatture',
    paidAmountDataKey: 'paidInvoicePaymentsAmount',
    pendingAmountDataKey: 'pendingInvoicePaymentsAmount',
    pendingLabel: 'Pagamenti fatture da incassare',
    priority: 1,
    stackId: 'invoice-payments',
    totalAmountDataKey: 'invoicePaymentsAmount',
  },
  {
    color: '#B45309',
    label: 'Pagamenti fornitori',
    paidAmountDataKey: 'paidSupplierInvoicePaymentsAmount',
    pendingAmountDataKey: 'pendingSupplierInvoicePaymentsAmount',
    pendingLabel: 'Pagamenti fornitori da pagare',
    priority: 3,
    stackId: 'supplier-invoice-payments',
    totalAmountDataKey: 'supplierInvoicePaymentsAmount',
  },
] as const;

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const toPendingAmount = (total: number, paid: number) => Math.max(total - paid, 0);
const formatCurrency = (value: number | string) => formatMoney(newMoney(value, 'EUR'));
const formatAxisCurrency = (value: unknown) =>
  formatMoneyShort(newMoney(typeof value === 'number' || typeof value === 'string' ? value : 0, 'EUR'));

interface Props {
  dateRange: DateRangeValue;
  isError: boolean;
  isLoading: boolean;
  onDateRangeChange: (dateRange: DateRangeValue) => void;
  stats: DashboardMonthlyCashflowStat[];
}

interface TooltipEntry {
  color?: string;
  dataKey?: string;
  fill?: string;
  name?: string;
  payload?: {
    [key: string]: number | string | undefined;
    fullLabel?: string;
  };
  stroke?: string;
  value?: number | string;
}

interface TooltipContentProps {
  active?: boolean;
  label?: string;
  payload?: TooltipEntry[];
}

const tooltipPriorityByDataKey = Object.fromEntries(
  series.flatMap((item) => [
    [item.paidAmountDataKey, item.priority],
    [item.pendingAmountDataKey, item.priority + 1],
  ]),
) as Record<string, number>;

const tooltipTotalDataKeyByDataKey = Object.fromEntries(
  series.map((item) => [item.paidAmountDataKey, item.totalAmountDataKey]),
) as Record<string, string>;

const ChartTooltipContent: React.FC<TooltipContentProps> = ({ active, label, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const fullLabel = payload[0]?.payload?.fullLabel ?? label;
  const sortedPayload = [...payload].sort((left, right) => {
    const leftPriority = tooltipPriorityByDataKey[left.dataKey ?? ''] ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = tooltipPriorityByDataKey[right.dataKey ?? ''] ?? Number.MAX_SAFE_INTEGER;

    return leftPriority - rightPriority;
  });

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        boxShadow: 3,
        minWidth: 250,
        px: 1.5,
        py: 1.25,
      }}
    >
      <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 600, mb: 0.75 }}>{fullLabel}</Typography>

      {sortedPayload.map((entry) => {
        const isOutlined = entry.fill === 'transparent';
        const color = entry.stroke || entry.color || 'currentColor';
        const totalDataKey = tooltipTotalDataKeyByDataKey[entry.dataKey ?? ''];
        const displayedValue = totalDataKey ? (entry.payload?.[totalDataKey] ?? entry.value) : entry.value;

        return (
          <Box
            key={`${entry.name}-${entry.dataKey}`}
            sx={{
              alignItems: 'center',
              color: 'text.primary',
              display: 'grid',
              gap: 1,
              gridTemplateColumns: '12px 1fr auto',
              py: 0.35,
            }}
          >
            <Box
              sx={{
                bgcolor: isOutlined ? 'transparent' : color,
                border: 2,
                borderColor: color,
                borderRadius: 0.5,
                height: 12,
                width: 12,
              }}
            />
            <Typography sx={{ color: 'text.primary', fontSize: 13, lineHeight: 1.2 }}>{entry.name}</Typography>
            <Typography
              sx={{
                color: 'text.primary',
                fontFeatureSettings: '"tnum"',
                fontSize: 13,
                lineHeight: 1.2,
                textAlign: 'right',
              }}
            >
              {formatCurrency(displayedValue ?? 0)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const MonthlyCashflowChartCard: React.FC<Props> = ({ dateRange, isError, isLoading, onDateRangeChange, stats }) => {
  const chartData = stats.map((stat) => {
    const monthDate = new Date(stat.year, stat.month - 1, 1);

    return {
      ...stat,
      fullLabel: capitalize(format(monthDate, 'MMMM yyyy', { locale: it })),
      label: capitalize(format(monthDate, 'MMM yy', { locale: it })),
      pendingInvoicePaymentsAmount: toPendingAmount(stat.invoicePaymentsAmount, stat.paidInvoicePaymentsAmount),
      pendingSupplierInvoicePaymentsAmount: toPendingAmount(
        stat.supplierInvoicePaymentsAmount,
        stat.paidSupplierInvoicePaymentsAmount,
      ),
    };
  });

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            alignItems: { md: 'flex-start', xs: 'stretch' },
            display: 'flex',
            flexDirection: { md: 'row', xs: 'column' },
            gap: 2,
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Typography gutterBottom variant="h5">
              Cashflow Fatture
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Andamento mensile dell&apos;intervallo selezionato per incassi fatture clienti e pagamenti fatture
              fornitori. La parte piena rappresenta gli importi gia regolati, quella con bordo gli importi ancora da
              incassare o pagare.
            </Typography>
          </Box>

          <DateRangePicker
            allowFuture
            dataTestId="dashboard-monthly-cashflow-date-range"
            onChange={onDateRangeChange}
            value={dateRange}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoading && isError ? (
          <Alert severity="error">Non sono riuscito a caricare il cashflow della dashboard.</Alert>
        ) : null}

        {!isLoading && !isError && chartData.length <= 0 ? (
          <Alert severity="info">Non ci sono dati disponibili per l&apos;intervallo selezionato.</Alert>
        ) : null}

        {!isLoading && !isError && chartData.length > 0 ? (
          <Box sx={{ width: '100%', height: { xs: 320, md: 380 } }}>
            <ResponsiveContainer>
              <BarChart data={chartData} barGap={4} barCategoryGap="36%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} tickFormatter={formatAxisCurrency} />
                <Tooltip content={<ChartTooltipContent />} />
                {series.map((item) => (
                  <Bar
                    key={item.paidAmountDataKey}
                    barSize={24}
                    dataKey={item.paidAmountDataKey}
                    fill={item.color}
                    name={item.label}
                    stackId={item.stackId}
                    stroke={item.color}
                  />
                ))}
                {series.map((item) => (
                  <Bar
                    key={item.pendingAmountDataKey}
                    barSize={24}
                    dataKey={item.pendingAmountDataKey}
                    fill="transparent"
                    name={item.pendingLabel}
                    stackId={item.stackId}
                    stroke={item.color}
                    strokeWidth={2}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MonthlyCashflowChartCard;
