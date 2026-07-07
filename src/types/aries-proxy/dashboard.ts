export interface DashboardMonthlyStatsList {
  monthlyStats: DashboardMonthlyStat[];
}

export interface DashboardMonthlyCashflowStatsList {
  monthlyCashflowStats: DashboardMonthlyCashflowStat[];
}

export interface DashboardMonthlyInvoicesStatsList {
  monthlyInvoicesStats: DashboardMonthlyInvoicesStat[];
}

export interface DashboardTimelineList {
  items: DashboardTimelineItem[];
}

export interface DashboardBankBalanceTrendList {
  bankBalanceTrend: DashboardBankBalanceTrendItem[];
}

export interface DashboardBankBalanceTrendItem {
  date: number;
  balance: number;
  accountBalances: DashboardBankBalanceTrendAccount[];
}

export interface DashboardBankBalanceTrendAccount {
  bankAccountId: number;
  bankAccountName: string;
  balance: number;
  isDefaultForPayments: boolean;
}

export interface DashboardMonthlyStatsDetails {
  year: number;
  month: number;
  sections: DashboardAsideSection[];
}

export interface DashboardMonthlyCashflowDetails {
  year: number;
  month: number;
  sections: DashboardAsideSection[];
}

export interface DashboardMonthlyInvoicesDetails {
  year: number;
  month: number;
  sections: DashboardAsideSection[];
}

export interface DashboardAsideSection {
  key: string;
  title: string;
  hasMore: boolean;
  moreUrl?: string;
  items: DashboardAsideItem[];
}

export interface DashboardAsideItem {
  id: number;
  paymentId?: number;
  year: number;
  date: number;
  title: string;
  subtitle?: string;
  counterpartName?: string;
  counterpartId?: number;
  counterpartType?: 'customer' | 'supplier';
  statusId?: number;
  statusName?: string;
  isOpen: boolean;
  amount?: number;
}

export interface DashboardTimelineItem {
  id: number;
  type: 'periodic-check' | 'expiring-ticket' | 'expiring-material' | 'expiring-system-sim';
  typeLabel: string;
  title: string;
  subtitle?: string;
  dueDate: number;
  customerId?: number;
  customerName?: string;
  systemId?: number;
  systemDescription?: string;
  urgency?: number;
  urgencyLabel?: string;
  isOpen: boolean;
}

export interface DashboardMonthlyStat {
  year: number;
  month: number;
  monthStart: number;
  reportGroupCount: number;
  reportGroupTotal: number;
  openReportGroupCount: number;
  openReportGroupTotal: number;
  reportCount: number;
  reportTotal: number;
  openReportCount: number;
  openReportTotal: number;
  invoiceCount: number;
  invoiceTotal: number;
  openInvoiceCount: number;
  openInvoiceTotal: number;
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
  invoicePrepaymentsCount: number;
  invoicePrepaymentsAmount: number;
  supplierInvoicePaymentsCount: number;
  paidSupplierInvoicePaymentsCount: number;
  supplierInvoicePaymentsAmount: number;
  paidSupplierInvoicePaymentsAmount: number;
  supplierInvoicePrepaymentsCount: number;
  supplierInvoicePrepaymentsAmount: number;
  scheduledSupplierInvoicePaymentsCount?: number;
  scheduledSupplierInvoicePaymentsAmount?: number;
}

export interface DashboardMonthlyInvoicesStat {
  year: number;
  month: number;
  monthStart: number;
  invoiceCount: number;
  invoiceAmount: number;
  preinvoiceCount: number;
  preinvoiceAmount: number;
  supplierInvoiceCount: number;
  supplierInvoiceAmount: number;
}

export interface DashboardMonthlyStatsRequest {
  fromDate?: string;
  toDate?: string;
}

export interface DashboardMonthlyDetailsRequest {
  year: number;
  month: number;
}
