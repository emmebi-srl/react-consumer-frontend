import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SdICoopStatus } from '~/types/aries-proxy/invoices';
import SdICoopStatusCard from './SdICoopStatusCard';

interface StatusQuery {
  data?: SdICoopStatus;
  isError: boolean;
  error: unknown;
}

const useSdICoopStatusMock = vi.fn<() => StatusQuery>();

vi.mock('~/proxies/aries-proxy/invoices', () => ({
  useSdICoopStatus: () => useSdICoopStatusMock(),
}));

const certificate = (daysToExpiry: number) => ({
  subject: 'CN=SDI-04371390263, OU=Client, OU=Fatturazione Elettronica, O=Agenzia delle Entrate, C=IT',
  issuer: 'CN=CA Agenzia delle Entrate, O=Agenzia delle Entrate, C=IT',
  serialNumber: '726BDBC92554B986',
  validFrom: 1795777282,
  validTo: 1890385281,
  daysToExpiry,
});

const mockStatus = (data: SdICoopStatus) => {
  useSdICoopStatusMock.mockReturnValue({ data, isError: false, error: null });
};

describe('SdICoopStatusCard', () => {
  beforeEach(() => {
    useSdICoopStatusMock.mockReset();
  });

  it('renders nothing for installations without a SDICoop channel', () => {
    mockStatus({ enabled: false, serviceAvailable: false });
    const { container } = render(<SdICoopStatusCard />);
    expect(container.innerHTML).toBe('');
  });

  it('shows a valid certificate with its expiry', () => {
    mockStatus({ enabled: true, serviceAvailable: true, clientCertificate: certificate(1094) });
    render(<SdICoopStatusCard />);
    expect(screen.getByText('Valido')).toBeTruthy();
    expect(screen.getByText('SDI-04371390263')).toBeTruthy();
    expect(screen.getByText(/scade tra 1094 giorni/)).toBeTruthy();
  });

  it('warns when the certificate is about to expire', () => {
    mockStatus({ enabled: true, serviceAvailable: true, clientCertificate: certificate(45) });
    render(<SdICoopStatusCard />);
    expect(screen.getByText('In scadenza')).toBeTruthy();
    expect(screen.getByText(/avviare subito il rinnovo/)).toBeTruthy();
  });

  it('reports an expired certificate', () => {
    mockStatus({ enabled: true, serviceAvailable: true, clientCertificate: certificate(-3) });
    render(<SdICoopStatusCard />);
    expect(screen.getByText('Scaduto')).toBeTruthy();
    expect(screen.getByText(/scaduto da 3 giorni/)).toBeTruthy();
  });

  it('reports a service that does not answer', () => {
    mockStatus({ enabled: true, serviceAvailable: false, message: 'Il servizio SDICoop non risponde.' });
    render(<SdICoopStatusCard />);
    expect(screen.getByText('Non attivo')).toBeTruthy();
    expect(screen.getByText('Il servizio SDICoop non risponde.')).toBeTruthy();
  });
});
