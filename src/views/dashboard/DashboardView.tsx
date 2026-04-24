import { useMemo, useState } from 'react';
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { Box } from '@mui/material';
import type { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import PageContainer from '~/components/Layout/PageContainer';
import { useDashboardMonthlyCashflowStats, useDashboardMonthlyStats } from '~/proxies/aries-proxy/dashboard';
import MonthlyCashflowChartCard from './components/MonthlyCashflowChartCard';
import MonthlyStatsChartCard from './components/MonthlyStatsChartCard';

const DashboardView = () => {
  const defaultStatsDateRange = useMemo<DateRangeValue>(() => {
    const today = new Date();

    return {
      endDate: endOfMonth(today),
      startDate: startOfMonth(addMonths(today, -5)),
    };
  }, []);
  const defaultCashflowDateRange = useMemo<DateRangeValue>(() => {
    const today = new Date();

    return {
      endDate: endOfMonth(addMonths(today, 3)),
      startDate: startOfMonth(addMonths(today, -2)),
    };
  }, []);
  const [statsDateRange, setStatsDateRange] = useState<DateRangeValue>(defaultStatsDateRange);
  const [cashflowDateRange, setCashflowDateRange] = useState<DateRangeValue>(defaultCashflowDateRange);

  const statsRange = useMemo(
    () => ({
      fromDate: format(statsDateRange.startDate ?? defaultStatsDateRange.startDate!, 'yyyy-MM-dd'),
      toDate: format(statsDateRange.endDate ?? defaultStatsDateRange.endDate!, 'yyyy-MM-dd'),
    }),
    [defaultStatsDateRange.endDate, defaultStatsDateRange.startDate, statsDateRange.endDate, statsDateRange.startDate],
  );
  const cashflowRange = useMemo(
    () => ({
      fromDate: format(cashflowDateRange.startDate ?? defaultCashflowDateRange.startDate!, 'yyyy-MM-dd'),
      toDate: format(cashflowDateRange.endDate ?? defaultCashflowDateRange.endDate!, 'yyyy-MM-dd'),
    }),
    [
      cashflowDateRange.endDate,
      cashflowDateRange.startDate,
      defaultCashflowDateRange.endDate,
      defaultCashflowDateRange.startDate,
    ],
  );

  const dashboardQuery = useDashboardMonthlyStats(statsRange);
  const cashflowQuery = useDashboardMonthlyCashflowStats(cashflowRange);

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MonthlyStatsChartCard
          dateRange={statsDateRange}
          isError={dashboardQuery.isError}
          isLoading={dashboardQuery.isLoading}
          onDateRangeChange={setStatsDateRange}
          stats={dashboardQuery.data?.monthlyStats ?? []}
        />
        <MonthlyCashflowChartCard
          dateRange={cashflowDateRange}
          isError={cashflowQuery.isError}
          isLoading={cashflowQuery.isLoading}
          onDateRangeChange={setCashflowDateRange}
          stats={cashflowQuery.data?.monthlyCashflowStats ?? []}
        />
      </Box>
    </PageContainer>
  );
};

export default DashboardView;
