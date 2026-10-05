import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { DashboardTimelineItem } from '~/types/aries-proxy/dashboard';
import DeadlineTimelineColumnSummary from './DeadlineTimelineColumnSummary';

const node = (type: DashboardTimelineItem['type'], isOpen: boolean, amount?: number) => ({
  color: '#000',
  date: new Date(2026, 9, 1),
  isOpen,
  item: { id: 1, type, typeLabel: '', title: '', dueDate: 0, isOpen, amount },
  type,
});

const typeOptions = [
  { color: '#D14343', icon: AutorenewRoundedIcon, key: 'periodic-check', label: 'Controlli periodici' },
  { color: '#E0A100', icon: ConfirmationNumberOutlinedIcon, key: 'expiring-ticket', label: 'Ticket in scadenza' },
  { color: '#2563EB', icon: ConfirmationNumberOutlinedIcon, key: 'expiring-material', label: 'Materiali in scadenza' },
] as const;

describe('DeadlineTimelineColumnSummary', () => {
  it('shows open and closed counts per present type and keeps the open amount in the tooltip', () => {
    render(
      <DeadlineTimelineColumnSummary
        nodes={[
          node('periodic-check', true, 1200),
          node('periodic-check', true, 3000),
          node('periodic-check', false, 500),
          node('expiring-ticket', true),
        ]}
        typeOptions={[...typeOptions]}
      />,
    );

    const summary = within(screen.getByLabelText('Riepilogo del mese'));
    expect(summary.getByText(/^2/).textContent).toContain('·1');
    expect(summary.getByLabelText(/4200,00/)).toBeTruthy();
    expect(summary.queryByText(/4200/)).toBeNull();
    expect(summary.getByText('1')).toBeTruthy();
  });

  it('renders nothing for an empty month', () => {
    const { container } = render(<DeadlineTimelineColumnSummary nodes={[]} typeOptions={[...typeOptions]} />);
    expect(container.textContent).toBe('');
  });
});
