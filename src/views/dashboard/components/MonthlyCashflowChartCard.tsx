import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BarShapeProps } from 'recharts';
import DateRangePicker, { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import {
  DashboardBankBalanceTrendItem,
  DashboardMonthlyCashflowStat,
  DashboardMonthlyInvoicesStat,
} from '~/types/aries-proxy/dashboard';
import { getDateByUnixtimestamp } from '~/utils/datetime-utils';
import { formatMoney, formatMoneyShort, newMoney } from '~/utils/money';
import { CategoricalChartFunc } from 'recharts/types/chart/types';
import { MouseEvent, useState } from 'react';
import { useSetDashboardAsideItem } from '../state';

type ChartMode = 'payments' | 'invoices';

const paymentSeries = [
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

const invoiceSeries = [
  {
    amountDataKey: 'invoiceAmount',
    color: '#0F766E',
    label: 'Fatture clienti',
    priority: 1,
    stackId: 'customer-invoices',
  },
  {
    amountDataKey: 'supplierInvoiceAmount',
    color: '#B45309',
    label: 'Fatture fornitori',
    priority: 3,
    stackId: 'supplier-invoices',
  },
] as const;

const customerPreinvoiceDataKey = 'preinvoiceAmount';

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const bankBalanceDataKey = 'bankBalance';
const bankBalanceLineColor = '#2563EB';
const scheduledSupplierInvoicePaymentsDataKey = 'scheduledSupplierInvoicePaymentsAmount';
const scheduledSupplierInvoicePaymentsColor = '#92400E';
const toPendingAmount = (total: number, paid: number) => Math.max(total - paid, 0);
const formatCurrency = (value: number | string) => formatMoney(newMoney(value, 'EUR'));
const formatAxisCurrency = (value: unknown) =>
  formatMoneyShort(newMoney(typeof value === 'number' || typeof value === 'string' ? value : 0, 'EUR'));

interface Props {
  balanceTrend: DashboardBankBalanceTrendItem[];
  dateRange: DateRangeValue;
  invoiceStats: DashboardMonthlyInvoicesStat[];
  isBalanceTrendError: boolean;
  isBalanceTrendLoading: boolean;
  isError: boolean;
  isInvoicesError: boolean;
  isInvoicesLoading: boolean;
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
    bankBalanceDateLabel?: string;
  };
  stroke?: string;
  value?: number | string;
}

interface TooltipContentProps {
  active?: boolean;
  label?: string;
  payload?: TooltipEntry[];
}

interface TooltipDisplayRow {
  color: string;
  dataKey: string;
  fill?: string;
  isScheduled?: boolean;
  label: string;
  value: number | string;
}

const tooltipPriorityByDataKey = Object.fromEntries([
  ...paymentSeries.flatMap((item) => [
    [item.paidAmountDataKey, item.priority],
    [item.pendingAmountDataKey, item.priority + 1],
  ]),
  ...invoiceSeries.flatMap((item) => [[item.amountDataKey, item.priority]]),
  [bankBalanceDataKey, 10],
  [customerPreinvoiceDataKey, 2],
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

interface ChartDataItem extends Partial<DashboardMonthlyCashflowStat>, Partial<DashboardMonthlyInvoicesStat> {
  bankBalance?: number;
  bankBalanceDateLabel?: string;
  fullLabel: string;
  label: string;
  month: number;
  monthStart: number;
  pendingInvoicePaymentsAmount: number;
  pendingSupplierInvoicePaymentsAmount: number;
  scheduledSupplierInvoicePaymentsAmount: number;
  summaryRows: AxisSummaryRow[];
  year: number;
}

interface BalanceLineDataItem {
  bankBalance: number;
  bankBalanceDateLabel: string;
  fullLabel: string;
  sortDate: number;
}

interface BalanceDotProps {
  cx?: number | string;
  cy?: number | string;
  payload?: BalanceLineDataItem;
  value?: unknown;
}

interface HoveredBalancePoint {
  balance: number | string;
  dateLabel: string;
  x: number;
  y: number;
}

interface AxisTickProps {
  payload?: {
    index?: number;
    value?: number | string;
  };
  x?: number;
  y?: number;
}

interface MonthlyCashflowCursorProps {
  dataLength: number;
  height?: number | string;
  left?: number | string;
  points?: { x?: number; y?: number }[];
  top?: number | string;
  width?: number | string;
  x?: number | string;
  y?: number | string;
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

const MonthlyCashflowCursor: React.FC<MonthlyCashflowCursorProps> = ({
  dataLength,
  height,
  left,
  points,
  top,
  width,
  x,
  y,
}) => {
  const plotLeft = Number(left ?? x ?? 0);
  const plotTop = Number(top ?? y ?? 0);
  const plotWidth = Number(width ?? 0);
  const plotHeight = Number(height ?? 0);
  const activeX = points?.[0]?.x;
  const bandWidth = dataLength > 0 ? plotWidth / dataLength : 0;

  if (
    activeX === undefined ||
    Number.isNaN(plotLeft) ||
    Number.isNaN(plotTop) ||
    Number.isNaN(plotWidth) ||
    Number.isNaN(plotHeight) ||
    Number.isNaN(activeX) ||
    Number.isNaN(bandWidth) ||
    plotWidth <= 0 ||
    plotHeight <= 0 ||
    bandWidth <= 0
  ) {
    return null;
  }

  const rectX = Math.max(plotLeft, Math.min(activeX - bandWidth / 2, plotLeft + plotWidth - bandWidth));

  return (
    <rect
      fill="#9CA3AF"
      fillOpacity={0.45}
      height={plotHeight}
      pointerEvents="none"
      width={bandWidth}
      x={rectX}
      y={plotTop}
    />
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

const BalanceDot: React.FC<BalanceDotProps & { onHover: (point?: HoveredBalancePoint) => void }> = ({
  cx,
  cy,
  onHover,
  payload,
  value,
}) => {
  if (cx === undefined || cy === undefined || value === undefined || value === null) {
    return null;
  }

  const numericX = Number(cx);
  const numericY = Number(cy);

  if (Number.isNaN(numericX) || Number.isNaN(numericY)) {
    return null;
  }

  return (
    <circle
      cx={numericX}
      cy={numericY}
      fill={bankBalanceLineColor}
      onMouseEnter={() =>
        onHover({
          balance: typeof value === 'number' || typeof value === 'string' ? value : 0,
          dateLabel: payload?.bankBalanceDateLabel ?? '',
          x: numericX,
          y: numericY,
        })
      }
      onMouseLeave={() => onHover(undefined)}
      r={4}
      stroke={bankBalanceLineColor}
      strokeWidth={2}
    />
  );
};

const BalancePointTooltip: React.FC<{ point?: HoveredBalancePoint }> = ({ point }) => {
  if (!point) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: '#111827',
        borderRadius: 1,
        boxShadow: 3,
        color: 'common.white',
        left: point.x,
        minWidth: 142,
        pointerEvents: 'none',
        position: 'absolute',
        px: 1.25,
        py: 0.75,
        top: point.y,
        transform: 'translate(-50%, calc(-100% - 12px))',
        zIndex: 10,
      }}
    >
      <Typography sx={{ color: '#E5E7EB', fontSize: 10.5, fontWeight: 600, lineHeight: 1.2, textAlign: 'center' }}>
        Saldo {point.dateLabel}
      </Typography>
      <Typography
        sx={{ color: 'common.white', fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, textAlign: 'center' }}
      >
        {formatAxisCurrency(point.balance)}
      </Typography>
    </Box>
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
  const rows = sortedPayload.flatMap<TooltipDisplayRow>((entry) => {
    if (entry.value === undefined) {
      return [];
    }

    const color = entry.stroke || entry.color || 'currentColor';
    const chartItem = entry.payload;
    const displayRows: TooltipDisplayRow[] = [
      {
        color,
        dataKey: entry.dataKey ?? '',
        fill: entry.fill,
        isScheduled: entry.dataKey === scheduledSupplierInvoicePaymentsDataKey,
        label: entry.name ?? '',
        value: entry.value ?? 0,
      },
    ];

    if (entry.dataKey === bankBalanceDataKey && chartItem?.bankBalanceDateLabel) {
      displayRows[0]!.label = `Saldo bancario (${chartItem.bankBalanceDateLabel})`;
    }

    if (entry.dataKey === 'paidInvoicePaymentsAmount') {
      const invoicePrepaymentsAmount = Number(chartItem?.invoicePrepaymentsAmount ?? 0);

      displayRows.push({
        color,
        dataKey: 'invoicePrepaymentsAmount',
        label: 'Acconti fatture',
        value: invoicePrepaymentsAmount,
      });
    }

    if (entry.dataKey === 'paidSupplierInvoicePaymentsAmount') {
      const supplierInvoicePrepaymentsAmount = Number(chartItem?.supplierInvoicePrepaymentsAmount ?? 0);

      displayRows.push({
        color,
        dataKey: 'supplierInvoicePrepaymentsAmount',
        label: 'Acconti fatture fornitori',
        value: supplierInvoicePrepaymentsAmount,
      });
    }

    return displayRows;
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

      {rows.map((row) => {
        const isOutlined = row.fill === 'transparent';

        return (
          <Box
            key={`${row.label}-${row.dataKey}`}
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
                bgcolor: isOutlined ? 'transparent' : row.color,
                border: 2,
                borderColor: row.color,
                borderRadius: 0.5,
                borderStyle: row.isScheduled ? 'dashed' : 'solid',
                height: 12,
                width: 12,
              }}
            />
            <Typography sx={{ color: 'text.primary', fontSize: 13, lineHeight: 1.2 }}>{row.label}</Typography>
            <Typography
              sx={{
                color: 'text.primary',
                fontFeatureSettings: '"tnum"',
                fontSize: 13,
                lineHeight: 1.2,
                textAlign: 'right',
              }}
            >
              {formatCurrency(row.value || 0)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const EmptyTooltipContent = () => null;

const MonthlyCashflowChartCard: React.FC<Props> = ({
  balanceTrend,
  dateRange,
  invoiceStats,
  isBalanceTrendError,
  isBalanceTrendLoading,
  isError,
  isInvoicesError,
  isInvoicesLoading,
  isLoading,
  onDateRangeChange,
  stats,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('payments');
  const [hoveredBalancePoint, setHoveredBalancePoint] = useState<HoveredBalancePoint>();
  const setAsideItem = useSetDashboardAsideItem();
  const balanceLineData: BalanceLineDataItem[] = balanceTrend
    .map((item) => ({
      bankBalance: item.balance,
      bankBalanceDateLabel: format(getDateByUnixtimestamp({ unixTimestamp: item.date }), 'dd/MM/yyyy'),
      fullLabel: `Saldo bancario ${format(getDateByUnixtimestamp({ unixTimestamp: item.date }), 'dd/MM/yyyy')}`,
      sortDate: getDateByUnixtimestamp({ unixTimestamp: item.date }).getTime(),
    }))
    .sort((left, right) => left.sortDate - right.sortDate);

  const paymentChartData: ChartDataItem[] = stats.map((stat) => {
    const monthDate = new Date(stat.year, stat.month - 1, 1);
    const pendingInvoicePaymentsAmount = toPendingAmount(stat.invoicePaymentsAmount, stat.paidInvoicePaymentsAmount);
    const pendingSupplierInvoicePaymentsAmount = toPendingAmount(
      stat.supplierInvoicePaymentsAmount,
      stat.paidSupplierInvoicePaymentsAmount,
    );
    const actualPaidInvoicePaymentsAmount = stat.paidInvoicePaymentsAmount + (stat.invoicePrepaymentsAmount || 0);
    const actualPaidSupplierInvoicePaymentsAmount =
      stat.paidSupplierInvoicePaymentsAmount + (stat.supplierInvoicePrepaymentsAmount || 0);
    const scheduledSupplierInvoicePaymentsAmount = stat.scheduledSupplierInvoicePaymentsAmount || 0;

    return {
      ...stat,
      paidInvoicePaymentsAmount: actualPaidInvoicePaymentsAmount,
      paidSupplierInvoicePaymentsAmount: actualPaidSupplierInvoicePaymentsAmount,
      fullLabel: capitalize(format(monthDate, 'MMMM yyyy', { locale: it })),
      label: capitalize(format(monthDate, 'MMM yyyy', { locale: it })),
      pendingInvoicePaymentsAmount,
      pendingSupplierInvoicePaymentsAmount,
      scheduledSupplierInvoicePaymentsAmount,
      summaryRows: [
        {
          color: paymentSeries[0].color,
          isZero: actualPaidInvoicePaymentsAmount <= 0,
          label: 'Inc.',
          value: formatAxisCurrency(actualPaidInvoicePaymentsAmount),
        },
        {
          color: paymentSeries[0].color,
          fill: 'transparent',
          isZero: pendingInvoicePaymentsAmount <= 0,
          label: 'Da inc.',
          value: formatAxisCurrency(pendingInvoicePaymentsAmount),
        },
        {
          color: paymentSeries[1].color,
          isZero: actualPaidSupplierInvoicePaymentsAmount <= 0,
          label: 'Pag.',
          value: formatAxisCurrency(actualPaidSupplierInvoicePaymentsAmount),
        },
        {
          color: paymentSeries[1].color,
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
  const invoiceChartData: ChartDataItem[] = invoiceStats.map((stat) => {
    const monthDate = new Date(stat.year, stat.month - 1, 1);

    return {
      ...stat,
      fullLabel: capitalize(format(monthDate, 'MMMM yyyy', { locale: it })),
      label: capitalize(format(monthDate, 'MMM yyyy', { locale: it })),
      pendingInvoicePaymentsAmount: 0,
      pendingSupplierInvoicePaymentsAmount: 0,
      scheduledSupplierInvoicePaymentsAmount: 0,
      summaryRows: [
        {
          color: invoiceSeries[0].color,
          isZero: stat.invoiceAmount <= 0,
          label: 'Fat. cli.',
          value: formatAxisCurrency(stat.invoiceAmount),
        },
        {
          color: invoiceSeries[0].color,
          fill: 'transparent',
          isZero: stat.preinvoiceAmount <= 0,
          label: 'Pref.',
          value: formatAxisCurrency(stat.preinvoiceAmount),
        },
        {
          color: invoiceSeries[1].color,
          isZero: stat.supplierInvoiceAmount <= 0,
          label: 'Fat. for.',
          value: formatAxisCurrency(stat.supplierInvoiceAmount),
        },
      ],
    };
  });
  const chartData = chartMode === 'payments' ? paymentChartData : invoiceChartData;
  const activeIsLoading = (chartMode === 'payments' ? isLoading : isInvoicesLoading) || isBalanceTrendLoading;
  const activeIsError = (chartMode === 'payments' ? isError : isInvoicesError) || isBalanceTrendError;
  const chartTitle = chartMode === 'payments' ? 'Cashflow Pagamenti Fatture' : 'Cashflow Fatture';
  const chartDescription =
    chartMode === 'payments'
      ? "Andamento mensile dell'intervallo selezionato per incassi fatture clienti e pagamenti fatture fornitori. La parte piena rappresenta gli importi gia regolati, quella con bordo gli importi ancora da incassare o pagare."
      : 'Totali mensili delle fatture clienti e fornitori per data documento. Le barre piene rappresentano le fatture, quelle trasparenti con bordo le prefatture dello stesso periodo.';
  const maxScheduledSupplierInvoicePaymentsAmount = Math.max(
    0,
    ...chartData.map((item) => item.scheduledSupplierInvoicePaymentsAmount),
  );
  const minChartWidth = Math.max(chartData.length * 164, 640);
  const xAxisDomain = [dateRange.startDate?.getTime() ?? 'dataMin', dateRange.endDate?.getTime() ?? 'dataMax'] as const;
  const onBarChartClick: CategoricalChartFunc<MouseEvent<SVGGraphicsElement>> = (dataParams) => {
    if (dataParams.activeIndex === undefined) return;
    const selected = chartData[Number(dataParams.activeIndex)];
    if (!selected) return;

    setAsideItem({
      type: chartMode === 'payments' ? 'monthly-cashflow' : 'monthly-invoices',
      year: selected.year,
      month: selected.month,
    });
  };
  const onBalancePointHover = (point?: HoveredBalancePoint) => {
    setHoveredBalancePoint(point);
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
              {chartTitle}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {chartDescription}
            </Typography>
          </Box>

          <Box sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <DateRangePicker
              allowFuture
              dataTestId="dashboard-monthly-cashflow-date-range"
              onChange={onDateRangeChange}
              value={dateRange}
            />
            <ToggleButtonGroup
              exclusive
              onChange={(_, value: ChartMode | null) => value && setChartMode(value)}
              size="small"
              value={chartMode}
            >
              <ToggleButton value="payments">Pagamenti</ToggleButton>
              <ToggleButton value="invoices">Fatture</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {activeIsLoading ? (
          <Box sx={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!activeIsLoading && activeIsError ? (
          <Alert severity="error">Non sono riuscito a caricare il cashflow della dashboard.</Alert>
        ) : null}

        {!activeIsLoading && !activeIsError && chartData.length <= 0 ? (
          <Alert severity="info">Non ci sono dati disponibili per l&apos;intervallo selezionato.</Alert>
        ) : null}

        {!activeIsLoading && !activeIsError && chartData.length > 0 ? (
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Box sx={{ height: { xs: 405, md: 450 }, minWidth: minChartWidth, position: 'relative', width: '100%' }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} barGap={4} barCategoryGap="36%" onClick={onBarChartClick}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    height={105}
                    interval={0}
                    tick={<MonthlyCashflowAxisTick data={chartData} />}
                    tickLine={false}
                  />
                  <XAxis
                    dataKey="sortDate"
                    domain={xAxisDomain}
                    hide
                    scale="time"
                    type="number"
                    xAxisId="balanceDate"
                  />
                  <YAxis
                    yAxisId="cashflow"
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax, maxScheduledSupplierInvoicePaymentsAmount)]}
                    tickFormatter={formatAxisCurrency}
                  />
                  <YAxis
                    yAxisId="balance"
                    allowDecimals={false}
                    domain={['auto', 'auto']}
                    orientation="right"
                    tickFormatter={formatAxisCurrency}
                  />
                  <Tooltip
                    content={hoveredBalancePoint ? <EmptyTooltipContent /> : <ChartTooltipContent />}
                    cursor={hoveredBalancePoint ? false : <MonthlyCashflowCursor dataLength={chartData.length} />}
                    wrapperStyle={{ zIndex: 5 }}
                  />
                  {chartMode === 'payments' ? (
                    <>
                      {paymentSeries.map((item) => (
                        <Bar
                          key={item.paidAmountDataKey}
                          barSize={24}
                          dataKey={item.paidAmountDataKey}
                          fill={item.color}
                          name={item.label}
                          stackId={item.stackId}
                          stroke={item.color}
                          yAxisId="cashflow"
                        />
                      ))}
                      {paymentSeries.map((item) => (
                        <Bar
                          key={item.pendingAmountDataKey}
                          barSize={24}
                          dataKey={item.pendingAmountDataKey}
                          fill="transparent"
                          name={item.pendingLabel}
                          stackId={item.stackId}
                          stroke={item.color}
                          strokeWidth={2}
                          yAxisId="cashflow"
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
                        yAxisId="cashflow"
                      />
                    </>
                  ) : (
                    <>
                      {invoiceSeries.map((item) => (
                        <Bar
                          key={item.amountDataKey}
                          barSize={24}
                          dataKey={item.amountDataKey}
                          fill={item.color}
                          name={item.label}
                          stackId={item.stackId}
                          stroke={item.color}
                          yAxisId="cashflow"
                        />
                      ))}
                      <Bar
                        barSize={24}
                        dataKey={customerPreinvoiceDataKey}
                        fill="transparent"
                        name="Prefatture clienti"
                        stackId="customer-invoices"
                        stroke={invoiceSeries[0].color}
                        strokeWidth={2}
                        yAxisId="cashflow"
                      />
                    </>
                  )}
                  <Line
                    connectNulls
                    data={balanceLineData}
                    dataKey={bankBalanceDataKey}
                    dot={<BalanceDot onHover={onBalancePointHover} />}
                    isAnimationActive={balanceLineData.length <= 18}
                    name="Saldo bancario"
                    stroke={bankBalanceLineColor}
                    strokeWidth={2.5}
                    type="monotone"
                    xAxisId="balanceDate"
                    yAxisId="balance"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <BalancePointTooltip point={hoveredBalancePoint} />
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MonthlyCashflowChartCard;
