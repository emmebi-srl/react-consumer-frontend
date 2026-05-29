import ariesServicesClient from '~/clients/aries-services-client';
import {
  DashboardMonthlyCashflowStatsList,
  DashboardMonthlyCashflowDetails,
  DashboardMonthlyDetailsRequest,
  DashboardMonthlyStatsDetails,
  DashboardMonthlyStatsList,
  DashboardMonthlyStatsRequest,
  DashboardTimelineList,
} from '~/types/aries-proxy/dashboard';

export const getDashboardMonthlyStats = (req: DashboardMonthlyStatsRequest) => {
  return ariesServicesClient.get<DashboardMonthlyStatsList>('dashboard/monthly-stats', { params: req });
};

export const getDashboardMonthlyCashflowStats = (req: DashboardMonthlyStatsRequest) => {
  return ariesServicesClient.get<DashboardMonthlyCashflowStatsList>('dashboard/monthly-cashflow-stats', {
    params: req,
  });
};

export const getDashboardMonthlyStatsDetails = (req: DashboardMonthlyDetailsRequest) => {
  return ariesServicesClient.get<DashboardMonthlyStatsDetails>('dashboard/monthly-stats-details', { params: req });
};

export const getDashboardMonthlyCashflowDetails = (req: DashboardMonthlyDetailsRequest) => {
  return ariesServicesClient.get<DashboardMonthlyCashflowDetails>('dashboard/monthly-cashflow-details', {
    params: req,
  });
};

export const getDashboardTimeline = (req: DashboardMonthlyStatsRequest) => {
  return ariesServicesClient.get<DashboardTimelineList>('dashboard/timeline', { params: req });
};
