import { useMemo, useState } from 'react';
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns';
import { Box } from '@mui/material';
import type { DateRangeValue } from '~/components/DateRangePicker/DateRangePicker';
import PageContainer from '~/components/Layout/PageContainer';
import {
  useDashboardBankBalanceTrend,
  useDashboardMonthlyCashflowStats,
  useDashboardMonthlyInvoicesStats,
  useDashboardMonthlyStats,
  useDashboardTimeline,
} from '~/proxies/aries-proxy/dashboard';
import DeadlineTimelineCard from './components/DeadlineTimelineCard';
import MonthlyCashflowChartCard from './components/MonthlyCashflowChartCard';
import MonthlyStatsChartCard from './components/MonthlyStatsChartCard';
import WeeklyEventsCard from './components/WeeklyEventsCard';
import SplitMain from '~/components/Layout/SplitMain';
import SplitLayout from '~/components/Layout/SplitLayout';
import DashboardAside from './components/DashboardAside';

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
  const defaultTimelineDateRange = useMemo<DateRangeValue>(() => {
    const today = new Date();

    return {
      endDate: endOfMonth(addMonths(today, 2)),
      startDate: startOfMonth(addMonths(today, -1)),
    };
  }, []);
  const [statsDateRange, setStatsDateRange] = useState<DateRangeValue>(defaultStatsDateRange);
  const [cashflowDateRange, setCashflowDateRange] = useState<DateRangeValue>(defaultCashflowDateRange);
  const [timelineDateRange, setTimelineDateRange] = useState<DateRangeValue>(defaultTimelineDateRange);

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
  const timelineRange = useMemo(
    () => ({
      fromDate: format(timelineDateRange.startDate ?? defaultTimelineDateRange.startDate!, 'yyyy-MM-dd'),
      toDate: format(timelineDateRange.endDate ?? defaultTimelineDateRange.endDate!, 'yyyy-MM-dd'),
    }),
    [
      defaultTimelineDateRange.endDate,
      defaultTimelineDateRange.startDate,
      timelineDateRange.endDate,
      timelineDateRange.startDate,
    ],
  );

  const dashboardQuery = useDashboardMonthlyStats(statsRange);
  const cashflowQuery = useDashboardMonthlyCashflowStats(cashflowRange);
  const bankBalanceTrendQuery = useDashboardBankBalanceTrend(cashflowRange);
  const invoicesQuery = useDashboardMonthlyInvoicesStats(cashflowRange);
  const timelineQuery = useDashboardTimeline(timelineRange);

  return (
    <SplitLayout>
      <SplitMain>
        <PageContainer>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <WeeklyEventsCard />
            <MonthlyCashflowChartCard
              dateRange={cashflowDateRange}
              balanceTrend={bankBalanceTrendQuery.data?.bankBalanceTrend ?? []}
              isError={cashflowQuery.isError}
              isBalanceTrendError={bankBalanceTrendQuery.isError}
              isBalanceTrendLoading={bankBalanceTrendQuery.isLoading}
              isInvoicesError={invoicesQuery.isError}
              isInvoicesLoading={invoicesQuery.isLoading}
              isLoading={cashflowQuery.isLoading}
              invoiceStats={invoicesQuery.data?.monthlyInvoicesStats ?? []}
              onDateRangeChange={setCashflowDateRange}
              stats={cashflowQuery.data?.monthlyCashflowStats ?? []}
            />
            <DeadlineTimelineCard
              dateRange={timelineDateRange}
              isError={timelineQuery.isError}
              isLoading={timelineQuery.isLoading}
              items={timelineQuery.data?.items ?? []}
              onDateRangeChange={setTimelineDateRange}
            />
            <MonthlyStatsChartCard
              dateRange={statsDateRange}
              isError={dashboardQuery.isError}
              isLoading={dashboardQuery.isLoading}
              onDateRangeChange={setStatsDateRange}
              stats={dashboardQuery.data?.monthlyStats ?? []}
            />
          </Box>
        </PageContainer>
      </SplitMain>
      <DashboardAside />
    </SplitLayout>
  );
};

export default DashboardView;
