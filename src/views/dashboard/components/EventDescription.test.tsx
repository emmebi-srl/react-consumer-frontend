import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EventDescription from './EventDescription';

describe('EventDescription', () => {
  it('links contacts while preserving their formatting and line breaks', () => {
    const text = 'Email: mario.rossi+ticket@example.it\nTel: +39 333 123 4567; ufficio: 02 1234567';
    const { container } = render(<EventDescription text={text} />);

    expect(container.textContent).toBe(text);
    expect(screen.getByRole('link', { name: 'mario.rossi+ticket@example.it' }).getAttribute('href')).toBe(
      'mailto:mario.rossi+ticket@example.it',
    );
    expect(screen.getByRole('link', { name: '+39 333 123 4567' }).getAttribute('href')).toBe('tel:+393331234567');
    expect(screen.getByRole('link', { name: '02 1234567' }).getAttribute('href')).toBe('tel:021234567');
  });

  it('does not turn dates, times or short document references into phone links', () => {
    const text = '23/09/2026, 2026-09-23, 23.09.2026, 09:00 - 10:30, Ticket 12345';
    const { container } = render(<EventDescription text={text} />);

    expect(container.textContent).toBe(text);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });
});
