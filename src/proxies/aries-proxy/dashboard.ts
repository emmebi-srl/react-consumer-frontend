import { useQuery } from '@tanstack/react-query';
import { getDashboardMonthlyCashflowStats, getDashboardMonthlyStats } from './api/dashboard';
import { DashboardMonthlyStatsRequest } from '~/types/aries-proxy/dashboard';

export const DashboardQueryKeys = {
  all: ['Dashboard'] as const,
  monthlyCashflowStats: (params: DashboardMonthlyStatsRequest) =>
    ['Dashboard', 'monthly-cashflow-stats', params] as const,
  monthlyStats: (params: DashboardMonthlyStatsRequest) => ['Dashboard', 'monthly-stats', params] as const,
};

export const useDashboardMonthlyStats = (params: DashboardMonthlyStatsRequest) => {
  return useQuery({
    queryKey: DashboardQueryKeys.monthlyStats(params),
    queryFn: async () => (await getDashboardMonthlyStats(params)).data,
  });
};

export const useDashboardMonthlyCashflowStats = (params: DashboardMonthlyStatsRequest) => {
  return useQuery({
    queryKey: DashboardQueryKeys.monthlyCashflowStats(params),
    queryFn: async () => (await getDashboardMonthlyCashflowStats(params)).data,
  });
};
