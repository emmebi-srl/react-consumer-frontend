export interface DashboardMonthlyStatsList {
  monthlyStats: DashboardMonthlyStat[];
}

export interface DashboardMonthlyCashflowStatsList {
  monthlyCashflowStats: DashboardMonthlyCashflowStat[];
}

export interface DashboardMonthlyStat {
  year: number;
  month: number;
  monthStart: number;
  reportGroupCount: number;
  openReportGroupCount: number;
  reportCount: number;
  openReportCount: number;
  invoiceCount: number;
  openInvoiceCount: number;
  jobCount: number;
  openJobCount: number;
}

export interface DashboardMonthlyCashflowStat {
  year: number;
  month: number;
  monthStart: number;
  invoicePaymentsCount: number;
  paidInvoicePaymentsCount: number;
  invoicePaymentsAmount: number;
  paidInvoicePaymentsAmount: number;
  supplierInvoicePaymentsCount: number;
  paidSupplierInvoicePaymentsCount: number;
  supplierInvoicePaymentsAmount: number;
  paidSupplierInvoicePaymentsAmount: number;
}

export interface DashboardMonthlyStatsRequest {
  fromDate?: string;
  toDate?: string;
}
