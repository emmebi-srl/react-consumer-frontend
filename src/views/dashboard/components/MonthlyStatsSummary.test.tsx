import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardMonthlyStat } from '~/types/aries-proxy/dashboard';
import MonthlyStatsSummary from './MonthlyStatsSummary';

const month = (overrides: Partial<DashboardMonthlyStat>): DashboardMonthlyStat => ({
  year: 2026,
  month: 1,
  monthStart: 0,
  reportGroupCount: 0,
  reportGroupTotal: 0,
  openReportGroupCount: 0,
  openSentReportGroupCount: 0,
  openReportGroupTotal: 0,
  openSentReportGroupTotal: 0,
  reportCount: 0,
  reportTotal: 0,
  openReportCount: 0,
  openReportTotal: 0,
  invoiceCount: 0,
  invoiceTotal: 0,
  openInvoiceCount: 0,
  openInvoiceTotal: 0,
  quoteCount: 0,
  openQuoteCount: 0,
  openSentQuoteCount: 0,
  jobCount: 0,
  openJobCount: 0,
  ...overrides,
});

const series = [
  {
    color: '#2E7D5B',
    label: 'Resoconti',
    stackId: 'report-groups',
    totalDataKey: 'reportGroupCount',
    openDataKey: 'openReportGroupCount',
    openSentDataKey: 'openSentReportGroupCount',
    totalAmountDataKey: 'reportGroupTotal',
    openTotalDataKey: 'openReportGroupTotal',
  },
  {
    color: '#7E57C2',
    label: 'Preventivi',
    stackId: 'quotes',
    totalDataKey: 'quoteCount',
    openDataKey: 'openQuoteCount',
    openSentDataKey: 'openSentQuoteCount',
  },
] as const;

describe('MonthlyStatsSummary', () => {
  it('sums all months without adding sent documents to the open count and recalculates for a new period', () => {
    const stats = [
      month({ reportGroupCount: 5, openReportGroupCount: 2, openSentReportGroupCount: 1, reportGroupTotal: 0.1 }),
      month({
        month: 2,
        reportGroupCount: 8,
        openReportGroupCount: 4,
        openSentReportGroupCount: 2,
        reportGroupTotal: 0.2,
        openReportGroupTotal: 0.1,
        quoteCount: 9,
      }),
    ];
    const { rerender } = render(<MonthlyStatsSummary series={series} stats={stats} />);
    const reportGroups = within(screen.getByRole('article', { name: 'Resoconti' }));
    expect(reportGroups.getByText('13')).toBeTruthy();
    expect(reportGroups.getByText('6')).toBeTruthy();
    expect(reportGroups.getByText('3')).toBeTruthy();
    expect(reportGroups.getByText(/0,30/)).toBeTruthy();
    expect(reportGroups.getByText(/0,10/)).toBeTruthy();
    const quotes = within(screen.getByRole('article', { name: 'Preventivi' }));
    expect(quotes.getByText('9')).toBeTruthy();
    expect(quotes.queryByText('Importo totale')).toBeNull();

    rerender(<MonthlyStatsSummary series={series} stats={[month({ reportGroupCount: 7 })]} />);
    expect(reportGroups.getByText('7')).toBeTruthy();
    expect(reportGroups.queryByText('13')).toBeNull();
    expect(reportGroups.getAllByText('0')).toHaveLength(2);
  });
});
