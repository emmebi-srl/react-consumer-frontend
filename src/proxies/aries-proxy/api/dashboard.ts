import ariesServicesClient from '~/clients/aries-services-client';
import {
  DashboardMonthlyCashflowStatsList,
  DashboardMonthlyStatsList,
  DashboardMonthlyStatsRequest,
} from '~/types/aries-proxy/dashboard';

export const getDashboardMonthlyStats = (req: DashboardMonthlyStatsRequest) => {
  return ariesServicesClient.get<DashboardMonthlyStatsList>('dashboard/monthly-stats', { params: req });
};

export const getDashboardMonthlyCashflowStats = (req: DashboardMonthlyStatsRequest) => {
  return ariesServicesClient.get<DashboardMonthlyCashflowStatsList>('dashboard/monthly-cashflow-stats', {
    params: req,
  });
};
