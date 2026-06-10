import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DateRangePicker, { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import { DashboardMonthlyStat } from '~/types/aries-proxy/dashboard';
import { useSetDashboardAsideItem } from '../state';
import { CategoricalChartFunc } from 'recharts/types/chart/types';
import { MouseEvent } from 'react';

const series = [
  {
    closedDataKey: 'closedReportGroupCount',
    color: '#2E7D5B',
    label: 'Resoconti',
    openLabel: 'Resoconti aperti',
    openDataKey: 'openReportGroupCount',
    priority: 1,
    stackId: 'report-groups',
    totalDataKey: 'reportGroupCount',
  },
  {
    closedDataKey: 'closedReportCount',
    color: '#2962FF',
    label: 'Rapporti',
    openLabel: 'Rapporti aperti',
    openDataKey: 'openReportCount',
    priority: 3,
    stackId: 'reports',
    totalDataKey: 'reportCount',
  },
  {
    closedDataKey: 'closedInvoiceCount',
    color: '#F59E0B',
    label: 'Fatture',
    openLabel: 'Fatture aperte',
    openDataKey: 'openInvoiceCount',
    priority: 5,
    stackId: 'invoices',
    totalDataKey: 'invoiceCount',
  },
  {
    closedDataKey: 'closedJobCount',
    color: '#C2410C',
    label: 'Commesse',
    openLabel: 'Commesse aperte',
    openDataKey: 'openJobCount',
    priority: 7,
    stackId: 'jobs',
    totalDataKey: 'jobCount',
  },
] as const;

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const toClosedCount = (total: number, open: number) => Math.max(total - open, 0);

interface Props {
  dateRange: DateRangeValue;
  isError: boolean;
  isLoading: boolean;
  onDateRangeChange: (dateRange: DateRangeValue) => void;
  stats: DashboardMonthlyStat[];
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
    [item.closedDataKey, item.priority],
    [item.openDataKey, item.priority + 1],
  ]),
) as Record<string, number>;

const tooltipTotalDataKeyByDataKey = Object.fromEntries(
  series.map((item) => [item.closedDataKey, item.totalDataKey]),
) as Record<string, string>;

interface AxisSummaryRow {
  color: string;
  isZero: boolean;
  label: string;
  open: number;
  total: number;
}

interface ChartDataItem extends DashboardMonthlyStat {
  closedInvoiceCount: number;
  closedJobCount: number;
  closedReportCount: number;
  closedReportGroupCount: number;
  fullLabel: string;
  label: string;
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

const MonthlyStatsAxisTick: React.FC<AxisTickProps & { data: ChartDataItem[] }> = ({ data, payload, x = 0, y = 0 }) => {
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
        <g key={row.label} opacity={row.isZero ? 0.45 : 1} transform={`translate(0,${32 + index * 15})`}>
          <rect fill={row.color} height={8} rx={2} width={8} x={-42} y={-7} />
          <text fill="#4B5563" fontSize={11} textAnchor="start" x={-29} y={0}>
            {row.label}{' '}
            <tspan fill="#111827" fontWeight={700}>
              {row.total}
            </tspan>{' '}
            <tspan fill="#6B7280">({row.open} ap.)</tspan>
          </text>
        </g>
      ))}
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
        minWidth: 220,
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
            key={`${entry.name}-${entry.value}`}
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
              {displayedValue}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const MonthlyStatsChartCard: React.FC<Props> = ({ dateRange, isError, isLoading, onDateRangeChange, stats }) => {
  const setAsideItem = useSetDashboardAsideItem();

  const chartData: ChartDataItem[] = stats.map((stat) => {
    const monthDate = new Date(stat.year, stat.month - 1, 1);

    return {
      closedInvoiceCount: toClosedCount(stat.invoiceCount, stat.openInvoiceCount),
      closedJobCount: toClosedCount(stat.jobCount, stat.openJobCount),
      closedReportCount: toClosedCount(stat.reportCount, stat.openReportCount),
      closedReportGroupCount: toClosedCount(stat.reportGroupCount, stat.openReportGroupCount),
      ...stat,
      label: capitalize(format(monthDate, 'MMM yyyy', { locale: it })),
      fullLabel: capitalize(format(monthDate, 'MMMM yyyy', { locale: it })),
      summaryRows: [
        {
          color: series[0].color,
          isZero: stat.reportGroupCount <= 0 && stat.openReportGroupCount <= 0,
          label: 'Res.',
          open: stat.openReportGroupCount,
          total: stat.reportGroupCount,
        },
        {
          color: series[1].color,
          isZero: stat.reportCount <= 0 && stat.openReportCount <= 0,
          label: 'Rap.',
          open: stat.openReportCount,
          total: stat.reportCount,
        },
        {
          color: series[2].color,
          isZero: stat.invoiceCount <= 0 && stat.openInvoiceCount <= 0,
          label: 'Fat.',
          open: stat.openInvoiceCount,
          total: stat.invoiceCount,
        },
        {
          color: series[3].color,
          isZero: stat.jobCount <= 0 && stat.openJobCount <= 0,
          label: 'Com.',
          open: stat.openJobCount,
          total: stat.jobCount,
        },
      ],
    };
  });

  const onBarChartClick: CategoricalChartFunc<MouseEvent<SVGGraphicsElement>> = (dataParams) => {
    if (dataParams.activeIndex === undefined) return;
    const selected = stats[Number(dataParams.activeIndex)];
    if (!selected) return;

    setAsideItem({
      type: 'monthly-stats',
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
              Andamento Documenti
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Andamento mensile dell&apos;intervallo selezionato. La parte piena rappresenta i documenti non aperti,
              mentre la parte vuota con bordo rappresenta quelli ancora aperti.
            </Typography>
          </Box>

          <DateRangePicker
            dataTestId="dashboard-monthly-stats-date-range"
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
          <Alert severity="error">Non sono riuscito a caricare le statistiche della dashboard.</Alert>
        ) : null}

        {!isLoading && !isError && chartData.length <= 0 ? (
          <Alert severity="info">Non ci sono dati disponibili per l&apos;intervallo selezionato.</Alert>
        ) : null}

        {!isLoading && !isError && chartData.length > 0 ? (
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Box sx={{ height: { xs: 395, md: 440 }, minWidth: Math.max(chartData.length * 140, 640), width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} barGap={2} barCategoryGap="24%" onClick={onBarChartClick}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    height={92}
                    interval={0}
                    tick={<MonthlyStatsAxisTick data={chartData} />}
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  {series.map((item) => (
                    <Bar
                      key={item.closedDataKey}
                      barSize={16}
                      dataKey={item.closedDataKey}
                      fill={item.color}
                      name={item.label}
                      stackId={item.stackId}
                      stroke={item.color}
                    />
                  ))}
                  {series.map((item) => (
                    <Bar
                      key={item.openDataKey}
                      barSize={16}
                      dataKey={item.openDataKey}
                      fill="transparent"
                      name={item.openLabel}
                      stackId={item.stackId}
                      stroke={item.color}
                      strokeWidth={2}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MonthlyStatsChartCard;
