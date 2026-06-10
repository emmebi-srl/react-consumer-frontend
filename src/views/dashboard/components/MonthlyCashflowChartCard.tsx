import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BarShapeProps } from 'recharts';
import DateRangePicker, { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import { DashboardMonthlyCashflowStat } from '~/types/aries-proxy/dashboard';
import { formatMoney, formatMoneyShort, newMoney } from '~/utils/money';
import { CategoricalChartFunc } from 'recharts/types/chart/types';
import { MouseEvent } from 'react';
import { useSetDashboardAsideItem } from '../state';

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
const scheduledSupplierInvoicePaymentsDataKey = 'scheduledSupplierInvoicePaymentsAmount';
const scheduledSupplierInvoicePaymentsColor = '#92400E';
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

const tooltipPriorityByDataKey = Object.fromEntries([
  ...series.flatMap((item) => [
    [item.paidAmountDataKey, item.priority],
    [item.pendingAmountDataKey, item.priority + 1],
  ]),
  [scheduledSupplierInvoicePaymentsDataKey, 5],
]) as Record<string, number>;

interface AxisSummaryRow {
  borderStyle?: 'dashed' | 'solid';
  color: string;
  fill?: string;
  isZero: boolean;
  label: string;
  value: string;
}

interface ChartDataItem extends DashboardMonthlyCashflowStat {
  fullLabel: string;
  label: string;
  pendingInvoicePaymentsAmount: number;
  pendingSupplierInvoicePaymentsAmount: number;
  scheduledSupplierInvoicePaymentsAmount: number;
  summaryRows: AxisSummaryRow[];
}

interface AxisTickProps {
  payload?: {
    index?: number;
    value?: string;
  };
  x?: number;
  y?: number;
}

const MonthlyCashflowAxisTick: React.FC<AxisTickProps & { data: ChartDataItem[] }> = ({
  data,
  payload,
  x = 0,
  y = 0,
}) => {
  const item =
    typeof payload?.index === 'number'
      ? data[payload.index]
      : data.find((chartDataItem) => chartDataItem.label === payload?.value);

  if (!item) {
    return null;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text fill="#374151" fontSize={12} fontWeight={700} textAnchor="middle" y={12}>
        {item.label}
      </text>
      {item.summaryRows.map((row, index) => (
        <g key={row.label} opacity={row.isZero ? 0.45 : 1} transform={`translate(0,${32 + index * 14})`}>
          <rect
            fill={row.fill ?? row.color}
            height={8}
            rx={2}
            stroke={row.color}
            strokeDasharray={row.borderStyle === 'dashed' ? '4 3' : undefined}
            strokeWidth={1.5}
            width={8}
            x={-47}
            y={-7}
          />
          <text fill="#4B5563" fontSize={10.5} textAnchor="start" x={-34} y={0}>
            {row.label}
          </text>
          <text fill="#111827" fontSize={10.5} fontWeight={700} textAnchor="end" x={68} y={0}>
            {row.value}
          </text>
        </g>
      ))}
    </g>
  );
};

const ScheduledSupplierInvoiceBarShape: React.FC<Partial<BarShapeProps>> = (props) => {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);

  return (
    <g>
      {height > 0 ? (
        <rect
          fill="transparent"
          height={height}
          pointerEvents="none"
          stroke={scheduledSupplierInvoicePaymentsColor}
          strokeDasharray="5 4"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          width={width}
          x={x}
          y={y}
        />
      ) : null}
    </g>
  );
};

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
        const isScheduled = entry.dataKey === scheduledSupplierInvoicePaymentsDataKey;
        const color = entry.stroke || entry.color || 'currentColor';
        const displayedValue = entry.value;

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
                borderStyle: isScheduled ? 'dashed' : 'solid',
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
  const setAsideItem = useSetDashboardAsideItem();

  const chartData: ChartDataItem[] = stats.map((stat) => {
    const monthDate = new Date(stat.year, stat.month - 1, 1);
    const pendingInvoicePaymentsAmount = toPendingAmount(stat.invoicePaymentsAmount, stat.paidInvoicePaymentsAmount);
    const pendingSupplierInvoicePaymentsAmount = toPendingAmount(
      stat.supplierInvoicePaymentsAmount,
      stat.paidSupplierInvoicePaymentsAmount,
    );
    const scheduledSupplierInvoicePaymentsAmount = stat.scheduledSupplierInvoicePaymentsAmount ?? 0;

    return {
      ...stat,
      fullLabel: capitalize(format(monthDate, 'MMMM yyyy', { locale: it })),
      label: capitalize(format(monthDate, 'MMM yyyy', { locale: it })),
      pendingInvoicePaymentsAmount,
      pendingSupplierInvoicePaymentsAmount,
      scheduledSupplierInvoicePaymentsAmount,
      summaryRows: [
        {
          color: series[0].color,
          isZero: stat.paidInvoicePaymentsAmount <= 0,
          label: 'Inc.',
          value: formatAxisCurrency(stat.paidInvoicePaymentsAmount),
        },
        {
          color: series[0].color,
          fill: 'transparent',
          isZero: pendingInvoicePaymentsAmount <= 0,
          label: 'Da inc.',
          value: formatAxisCurrency(pendingInvoicePaymentsAmount),
        },
        {
          color: series[1].color,
          isZero: stat.paidSupplierInvoicePaymentsAmount <= 0,
          label: 'Pag.',
          value: formatAxisCurrency(stat.paidSupplierInvoicePaymentsAmount),
        },
        {
          color: series[1].color,
          fill: 'transparent',
          isZero: pendingSupplierInvoicePaymentsAmount <= 0,
          label: 'Da pag.',
          value: formatAxisCurrency(pendingSupplierInvoicePaymentsAmount),
        },
        {
          borderStyle: 'dashed',
          color: scheduledSupplierInvoicePaymentsColor,
          fill: 'transparent',
          isZero: scheduledSupplierInvoicePaymentsAmount <= 0,
          label: 'Prog.',
          value: formatAxisCurrency(scheduledSupplierInvoicePaymentsAmount),
        },
      ],
    };
  });
  const maxScheduledSupplierInvoicePaymentsAmount = Math.max(
    0,
    ...chartData.map((item) => item.scheduledSupplierInvoicePaymentsAmount),
  );
  const onBarChartClick: CategoricalChartFunc<MouseEvent<SVGGraphicsElement>> = (dataParams) => {
    if (dataParams.activeIndex === undefined) return;
    const selected = stats[Number(dataParams.activeIndex)];
    if (!selected) return;

    setAsideItem({
      type: 'monthly-cashflow',
      year: selected.year,
      month: selected.month,
    });
  };

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
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Box sx={{ height: { xs: 405, md: 450 }, minWidth: Math.max(chartData.length * 164, 640), width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} barGap={4} barCategoryGap="36%" onClick={onBarChartClick}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    height={105}
                    interval={0}
                    tick={<MonthlyCashflowAxisTick data={chartData} />}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax, maxScheduledSupplierInvoicePaymentsAmount)]}
                    tickFormatter={formatAxisCurrency}
                  />
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
                  <Bar
                    barSize={24}
                    dataKey={scheduledSupplierInvoicePaymentsDataKey}
                    fill="transparent"
                    name="Spese future programmate"
                    shape={<ScheduledSupplierInvoiceBarShape />}
                    stackId="supplier-invoice-payments"
                    stroke={scheduledSupplierInvoicePaymentsColor}
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MonthlyCashflowChartCard;
