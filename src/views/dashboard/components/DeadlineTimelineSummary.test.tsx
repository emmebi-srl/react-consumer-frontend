import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { DashboardTimelineItem } from '~/types/aries-proxy/dashboard';
import DeadlineTimelineSummary from './DeadlineTimelineSummary';

const item = (overrides: Partial<DashboardTimelineItem>): DashboardTimelineItem => ({
  id: 1,
  type: 'periodic-check',
  typeLabel: '',
  title: '',
  dueDate: 0,
  isOpen: true,
  ...overrides,
});

const typeOptions = [
  { color: '#D14343', icon: AutorenewRoundedIcon, key: 'periodic-check', label: 'Controlli periodici' },
  { color: '#E0A100', icon: ConfirmationNumberOutlinedIcon, key: 'expiring-ticket', label: 'Ticket in scadenza' },
] as const;

describe('DeadlineTimelineSummary', () => {
  it('counts open and closed items per type and sums the open periodic check amounts', () => {
    const items = [
      item({ amount: 100 }),
      item({ amount: 50.5 }),
      item({}),
      item({ amount: 999, isOpen: false }),
      item({ type: 'expiring-ticket' }),
      item({ type: 'expiring-ticket', isOpen: false, amount: 10 }),
    ];
    render(<DeadlineTimelineSummary items={items} typeOptions={[...typeOptions]} />);

    const checks = within(screen.getByRole('article', { name: 'Controlli periodici' }));
    expect(checks.getByText('Aperte').nextSibling?.textContent).toBe('3');
    expect(checks.getByText('Chiuse').nextSibling?.textContent).toBe('1');
    expect(checks.getByText(/150,50/)).toBeTruthy();
    expect(checks.getByText('1 senza importo')).toBeTruthy();

    const tickets = within(screen.getByRole('article', { name: 'Ticket in scadenza' }));
    expect(tickets.getByText('Aperte').nextSibling?.textContent).toBe('1');
    expect(tickets.getByText('Chiuse').nextSibling?.textContent).toBe('1');
    expect(tickets.queryByText('Importo aperto')).toBeNull();
  });
});
