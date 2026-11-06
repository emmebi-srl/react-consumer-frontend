import { describe, expect, it } from 'vitest';
import { Ddt } from '~/types/aries-proxy/ddts';
import { encodeRtfText } from '~/utils/rtf-utils';
import {
  emptyNoteRow,
  fromDdt,
  getRowTotals,
  isNoteRow,
  parseDecimal,
  toRowValues,
  toSaveRequest,
} from './ddtFormValues';

const baseDdt: Ddt = {
  id: 17,
  year: 2021,
  customerId: 6893,
  customerName: 'RENO DE MEDICI S.P.A.',
  destinationId: 2,
  systemId: 0,
  documentDate: 1612915200,
  causalId: 'VI',
  statusId: 1,
  isPrinted: false,
  printTransportTime: true,
  printPickupDateTime: false,
  packages: 1,
  weight: 1,
  aspects: 8,
  hasRecipientSignature: false,
  hasDriverSignature: false,
  jobLink: { jobId: 18, jobYear: 2012, subJobId: 1, lotId: 1, jobDescription: 'Commessa' },
  rows: [
    {
      productCode: '36550513',
      description: 'CENTRALE IQ8',
      quantity: 1,
      price: 2640,
      cost: 844.8,
      discount: 0,
      depotId: 1,
    },
    { description: encodeRtfText('Nota di Delphi'), rowType: 'N', price: 0, cost: 0, discount: 0 },
  ],
};

describe('ddtFormValues', () => {
  it('parses the Italian decimal comma', () => {
    expect(parseDecimal('1,5')).toBe(1.5);
    expect(parseDecimal(' 2 ')).toBe(2);
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
  });

  it('loads a DDT: no system when it is 0, RTF notes shown as text', () => {
    const values = fromDdt(baseDdt, 1);
    expect(values.isCustomer).toBe(true);
    expect(values.recipient).toEqual({ id: 6893, name: 'RENO DE MEDICI S.P.A.' });
    expect(values.systemId).toBe('');
    expect(values.rows[1]?.text).toBe('Nota di Delphi');
    expect(isNoteRow(values.rows[1]!)).toBe(true);
    expect(isNoteRow(values.rows[0]!)).toBe(false);
  });

  it('sends the original RTF back when a note did not change, and re-encodes it when it did', () => {
    const values = fromDdt(baseDdt, 1);
    const unchanged = toSaveRequest(values);
    expect(unchanged.rows?.[1]?.description).toBe(baseDdt.rows?.[1]?.description);

    values.rows[1] = { ...values.rows[1]!, text: 'Nota cambiata' };
    const changed = toSaveRequest(values);
    expect(changed.rows?.[1]?.description).toBe(encodeRtfText('Nota cambiata'));
  });

  it('keeps plain text notes plain', () => {
    const row = toRowValues({ description: 'Testo semplice', rowType: 'N', price: 0, cost: 0, discount: 0 });
    const values = { ...fromDdt(baseDdt, 1), rows: [{ ...row, text: 'Altro testo' }] };
    expect(toSaveRequest(values).rows?.[0]?.description).toBe('Altro testo');
  });

  it('sends the rows and the job lot, and no job for a supplier', () => {
    const values = fromDdt(baseDdt, 1);
    const request = toSaveRequest(values);
    expect(request.rows).toHaveLength(2);
    expect(request.jobLink).toEqual({ jobId: 18, jobYear: 2012, subJobId: 1, lotId: 1 });
    expect(toSaveRequest({ ...values, isCustomer: false }).jobLink).toBeNull();
  });

  it('sends the economy quantity, all of it for an "E" row', () => {
    const values = fromDdt(baseDdt, 1);
    values.rows[0] = { ...values.rows[0]!, quantity: '3', economy: '1,5' };
    expect(toSaveRequest(values).rows?.[0]?.economy).toBe(1.5);
    values.rows[0] = { ...values.rows[0], rowType: 'E' };
    expect(toSaveRequest(values).rows?.[0]?.economy).toBe(3);
  });

  it('keeps the serial numbers of the kit components', () => {
    const row = toRowValues({
      productCode: '27240849',
      description: 'AXEL',
      price: 0,
      cost: 0,
      discount: 0,
      rowType: 'Y',
      kitComponents: [{ productCode: 'A', serialNumber: 'SN1' }],
    });
    const values = { ...fromDdt(baseDdt, 1), rows: [row] };
    expect(toSaveRequest(values).rows?.[0]?.kitComponents).toEqual([{ productCode: 'A', serialNumber: 'SN1' }]);
  });

  it('maps empty selects to null and keeps the DDT number empty for the automatic one', () => {
    const values = { ...fromDdt(baseDdt, 1), ddtNumber: '', carrierId: '' as const, paymentConditionId: '' as const };
    const request = toSaveRequest(values);
    expect(request.ddtNumber).toBeNull();
    expect(request.carrierId).toBeNull();
    expect(request.paymentConditionId).toBeNull();
    expect(request.systemId).toBeNull();
  });

  it('sends the transport start as unix seconds', () => {
    const values = { ...fromDdt(baseDdt, 1), transportDate: '2026-11-06', transportTime: '09:30' };
    const request = toSaveRequest(values);
    expect(request.transportStart).toBe(Math.floor(new Date(2026, 10, 6, 9, 30).getTime() / 1000));
    expect(toSaveRequest({ ...values, transportDate: '' }).transportStart).toBeNull();
  });

  it('computes price and cost totals like the Delphi footer', () => {
    const values = fromDdt(baseDdt, 1);
    values.rows.push({ ...emptyNoteRow(), quantity: '2', price: '10,5', cost: '4' });
    expect(getRowTotals(values.rows)).toEqual({ price: 2640 + 21, cost: 844.8 + 8 });
  });
});
