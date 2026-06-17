import { useQuery } from '@tanstack/react-query';
import {
  getDashboardMonthlyCashflowDetails,
  getDashboardMonthlyCashflowStats,
  getDashboardMonthlyInvoicesDetails,
  getDashboardMonthlyInvoicesStats,
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
  monthlyInvoicesStats: (params: DashboardMonthlyStatsRequest) =>
    ['Dashboard', 'monthly-invoices-stats', params] as const,
  monthlyInvoicesDetails: (params: DashboardMonthlyDetailsRequest) =>
    ['Dashboard', 'monthly-invoices-details', params] as const,
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

export const useDashboardMonthlyInvoicesStats = (params: DashboardMonthlyStatsRequest) => {
  return useQuery({
    queryKey: DashboardQueryKeys.monthlyInvoicesStats(params),
    queryFn: async () => (await getDashboardMonthlyInvoicesStats(params)).data,
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

export const useDashboardMonthlyInvoicesDetails = (params: DashboardMonthlyDetailsRequest, enabled = true) => {
  return useQuery({
    queryKey: DashboardQueryKeys.monthlyInvoicesDetails(params),
    queryFn: async () => (await getDashboardMonthlyInvoicesDetails(params)).data,
    enabled,
  });
};

export const useDashboardTimeline = (params: DashboardMonthlyStatsRequest) => {
  return useQuery({
    queryKey: DashboardQueryKeys.timeline(params),
    queryFn: async () => (await getDashboardTimeline(params)).data,
  });
};
