import { atom, useAtom, useSetAtom } from 'jotai';

export interface SelectedMonthlyStats {
  type: 'monthly-stats';
  month: number;
  year: number;
}

export interface SelectedMonthlyCashflow {
  type: 'monthly-cashflow';
  month: number;
  year: number;
}

export interface SelectedMonthlyInvoices {
  type: 'monthly-invoices';
  month: number;
  year: number;
}

export interface SelectedTimelineItem {
  type: 'timeline-item';
}

type DashboardAsideItem =
  | SelectedMonthlyStats
  | SelectedMonthlyCashflow
  | SelectedMonthlyInvoices
  | SelectedTimelineItem;

const dashboardAsideItem = atom<DashboardAsideItem>();

export const useDashboardAsideItem = () => useAtom(dashboardAsideItem);
export const useSetDashboardAsideItem = () => useSetAtom(dashboardAsideItem);
