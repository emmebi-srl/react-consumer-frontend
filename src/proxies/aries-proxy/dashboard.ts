import { useQuery } from '@tanstack/react-query';
import {
  getDashboardMonthlyCashflowDetails,
  getDashboardMonthlyCashflowStats,
  getDashboardMonthlyStats,
  getDashboardMonthlyStatsDetails,
  getDashboardTimeline,
} from './api/dashboard';
import { DashboardMonthlyDetailsRequest, DashboardMonthlyStatsRequest } from '~/types/aries-proxy/dashboard';

export const DashboardQueryKeys = {
  all: ['Dashboard'] as const,
  monthlyCashflowStats: (params: DashboardMonthlyStatsRequest) =>
    ['Dashboard', 'monthly-cashflow-stats', params] as const,
  monthlyCashflowDetails: (params: DashboardMonthlyDetailsRequest) =>
    ['Dashboard', 'monthly-cashflow-details', params] as const,
  monthlyStatsDetails: (params: DashboardMonthlyDetailsRequest) =>
    ['Dashboard', 'monthly-stats-details', params] as const,
  monthlyStats: (params: DashboardMonthlyStatsRequest) => ['Dashboard', 'monthly-stats', params] as const,
  timeline: (params: DashboardMonthlyStatsRequest) => ['Dashboard', 'timeline', params] as const,
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

export const useDashboardMonthlyStatsDetails = (params: DashboardMonthlyDetailsRequest, enabled = true) => {
  return useQuery({
    queryKey: DashboardQueryKeys.monthlyStatsDetails(params),
    queryFn: async () => (await getDashboardMonthlyStatsDetails(params)).data,
    enabled,
  });
};

export const useDashboardMonthlyCashflowDetails = (params: DashboardMonthlyDetailsRequest, enabled = true) => {
  return useQuery({
    queryKey: DashboardQueryKeys.monthlyCashflowDetails(params),
    queryFn: async () => (await getDashboardMonthlyCashflowDetails(params)).data,
    enabled,
  });
};

export const useDashboardTimeline = (params: DashboardMonthlyStatsRequest) => {
  return useQuery({
    queryKey: DashboardQueryKeys.timeline(params),
    queryFn: async () => (await getDashboardTimeline(params)).data,
  });
};
