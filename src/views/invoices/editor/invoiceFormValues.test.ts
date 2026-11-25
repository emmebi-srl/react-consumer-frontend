import { describe, expect, it } from 'vitest';
import { VatType } from '~/types/aries-proxy/invoices';
import { encodeRtfText } from '~/utils/rtf-utils';
import {
  addDocuments,
  computeTotals,
  groupRows,
  groupSystems,
  emptyProductRow,
  getZeroPriceRows,
  InvoiceFormValues,
  isAnyDocumentRow,
  isReportRow,
  noteRow,
  removeDocument,
  toRowValues,
  toSaveRequest,
} from './invoiceFormValues';

const vat = (id: number, rate: number, extra: Partial<VatType> = {}): VatType => ({
  id,
  name: `IVA ${rate}%`,
  rate,
  isDefault: false,
  inUse: true,
  ...extra,
});

const VATS = [
  vat(28, 22, { isDefault: true }),
  vat(30, 22, { name: 'SPLIT 22%' }),
  vat(10, 10),
  vat(15, 0, { name: 'A.15' }),
  vat(27, 0, { name: 'REVERSE CHARGE' }),
];

const values = (patch: Partial<InvoiceFormValues>): InvoiceFormValues => ({
  isPreinvoice: false,
  invoiceNumber: '',
  invoiceDate: '2025-03-01',
  customer: { id: 1, name: 'Cliente' },
  destinationId: 1,
  typeId: 1,
  causalId: 4,
  paymentConditionId: 121,
  vatId: 28,
  vatNatureTypeId: '',
  bank: null,
  iban: '',
  isOurBank: false,
  annotations: '',
  originalAnnotations: null,
  internalNote: '',
  receptionDocumentId: '',
  collectionCost: '0',
  stampDuty: '0',
  transportCost: '0',
  productsDiscount: '0',
  isSubcontract: false,
  shouldMoveDepot: false,
  interventionTypeId: '',
  systemTypeId: '',
  hasPurchaseOrder: false,
  purchaseOrderDocumentId: '',
  purchaseOrderDate: '',
  purchaseOrderCig: '',
  purchaseOrderCup: '',
  rows: [],
  documentsToAdd: [],
  documentsToRemove: [],
  ...patch,
});

const row = (
  price: string,
  quantity: string,
  vatRate: number,
  extra: Partial<ReturnType<typeof emptyProductRow>> = {},
) => ({
  ...emptyProductRow(vatRate),
  text: 'riga',
  price,
  quantity,
  ...extra,
});

describe('computeTotals', () => {
  it('groups the rows by VAT, rounding each row like Delphi', () => {
    const totals = computeTotals(
      values({ rows: [row('10.005', '3', 22, { discount: '10' }), row('100', '1', 10), noteRow('nota')] }),
      VATS,
    );
    // 10.005 * 0.9 * 3 = 27.0135 -> 27.01
    expect(totals.amounts.map((amount) => [amount.vat.id, amount.taxableAmount, amount.taxAmount])).toEqual([
      [10, 100, 10],
      [28, 27.01, 5.94],
    ]);
    expect(totals.taxableAmount).toBe(127.01);
    expect(totals.totalAmount).toBe(142.95);
  });

  it('uses the invoice VAT for rows with its rate (split payment)', () => {
    const totals = computeTotals(values({ vatId: 30, rows: [row('100', '1', 22)] }), VATS);
    expect(totals.amounts.map((amount) => amount.vat.id)).toEqual([30]);
  });

  it('puts collection and transport on the default VAT and the stamp duty on 0%', () => {
    const totals = computeTotals(
      values({ rows: [row('100', '1', 22)], collectionCost: '2', stampDuty: '2', transportCost: '10' }),
      VATS,
    );
    expect(totals.amounts.map((amount) => [amount.vat.id, amount.taxableAmount])).toEqual([
      [15, 2],
      [28, 112],
    ]);
    expect(totals.taxAmount).toBe(24.64);
  });

  it('charges only the tax for the "only tax" debit note', () => {
    const totals = computeTotals(values({ typeId: 4, rows: [row('100', '1', 22)], stampDuty: '2' }), VATS);
    expect(totals.taxableAmount).toBe(0);
    expect(totals.taxAmount).toBe(22);
  });

  it('warns when with VAT 10% the products are worth more than the rest', () => {
    const totals = computeTotals(
      values({ rows: [row('100', '1', 10, { productCode: 'ART1' }), row('50', '1', 10)] }),
      VATS,
    );
    expect(totals.vat10ProductsAlert).toBe(true);
  });
});

describe('rows', () => {
  it('lists the priced rows at zero', () => {
    expect(getZeroPriceRows([row('0', '1', 22, { productCode: 'A1' }), noteRow('nota'), row('5', '1', 22)])).toEqual([
      'riga 1 (A1): riga',
    ]);
  });

  it('sends back the Delphi RTF when the text was not changed, and re-encodes it otherwise', () => {
    const rtf = encodeRtfText('Descrizione');
    const loaded = toRowValues({ description: rtf, rowType: '', price: 1, quantity: 1, vatRate: 22 });
    expect(toSaveRequest(values({ rows: [loaded] })).rows[0]?.description).toBe(rtf);
    const changed = { ...loaded, text: 'Altro' };
    const description = toSaveRequest(values({ rows: [changed] })).rows[0]?.description ?? '';
    expect(description.startsWith('{\\rtf')).toBe(true);
    expect(description).not.toBe(rtf);
  });

  it('sends no price nor VAT for text rows', () => {
    const request = toSaveRequest(values({ rows: [{ ...noteRow('nota'), price: '5', vatRate: 22 }] }));
    expect(request.rows[0]).toMatchObject({ rowType: 'N', price: null, vatRate: null });
  });

  it('removes the purchase order when unchecked', () => {
    expect(toSaveRequest(values({ purchaseOrderDocumentId: 'X' })).purchaseOrder).toBeNull();
    expect(
      toSaveRequest(
        values({ hasPurchaseOrder: true, purchaseOrderDocumentId: ' 12 ', purchaseOrderDate: '2025-01-02' }),
      ).purchaseOrder,
    ).toEqual({ documentId: '12', date: '2025-01-02', cigCode: '', cupCode: '' });
  });
});

describe('documents', () => {
  const imported = [
    { description: 'Riferimento rapp n.5 del 01-03-2025', rowType: '!', referenceId: '12', referenceYear: '2025' },
    { description: '7 Impianto sede', rowType: 'I', referenceId: '7|12', referenceYear: '1|2025' },
    {
      description: 'Intervento tecnico',
      rowType: '-',
      referenceId: '12',
      referenceYear: '2025',
      price: 30,
      quantity: 2,
    },
  ];
  const report = { type: 'report' as const, id: 12, year: 2025 };

  it('appends the rows and records the document to link', () => {
    const next = addDocuments(values({ rows: [noteRow('nota')] }), imported, [report]);
    expect(next.rows.map((row) => row.rowType)).toEqual(['N', '!', 'I', '-']);
    expect(next.documentsToAdd).toEqual([report]);
  });

  it('removes all the rows of a document: an imported one is just forgotten, a saved one is unlinked', () => {
    const added = values(addDocuments(values({}), imported, [report]));
    const afterAdded = removeDocument(added, report);
    expect(afterAdded.rows).toEqual([]);
    expect(afterAdded.documentsToAdd).toEqual([]);
    expect(afterAdded.documentsToRemove).toEqual([]);

    const saved = values({ rows: imported.map(toRowValues) });
    const afterSaved = removeDocument(saved, report);
    expect(afterSaved.rows).toEqual([]);
    expect(afterSaved.documentsToRemove).toEqual([report]);
    expect(addDocuments(afterSaved, imported, [report]).documentsToRemove).toEqual([]);
  });
});

describe('grouping', () => {
  const docRows = (): InvoiceFormValues['rows'] =>
    [
      { description: 'Riferimento rapp n.5', rowType: '!', referenceId: '12', referenceYear: '2025' },
      { description: '7 Impianto sede', rowType: 'I', referenceId: '7|12', referenceYear: '1|2025' },
      {
        description: 'Ore',
        rowType: '-',
        referenceId: '12',
        referenceYear: '2025',
        price: 30,
        quantity: 2,
        discount: 10,
        cost: 20,
        vatRate: 22,
      },
      { description: 'RIFERIMENTO DDT 3', rowType: '?', referenceId: '3', referenceYear: '2025' },
      {
        description: 'Batteria',
        rowType: '+',
        referenceId: '3',
        referenceYear: '2025',
        price: 10,
        quantity: 3,
        cost: 6,
        vatRate: 22,
      },
      { description: 'Riga libera', rowType: '', price: 5, quantity: 1, vatRate: 22 },
    ].map(toRowValues);

  it('groups every document row in one priced row, keeping the totals', () => {
    const grouped = groupRows(docRows(), isAnyDocumentRow, 'DOCUMENTI RAGGRUPPATI', 22);
    expect(grouped?.count).toBe(5);
    expect(grouped?.rows.map((row) => row.text)).toEqual(['Riga libera', 'DOCUMENTI RAGGRUPPATI']);
    // 30 * 0.9 * 2 + 10 * 3 = 84; cost 20 * 2 + 6 * 3 = 58
    expect(grouped?.rows[1]).toMatchObject({
      rowType: 'R',
      quantity: '1',
      measureUnit: '--',
      price: '84',
      cost: '58',
      discount: '0',
      vatRate: 22,
    });
  });

  it('groups only the reports', () => {
    const grouped = groupRows(docRows(), isReportRow, 'RAPPORTI RAGGRUPPATI', 22);
    expect(grouped?.rows.map((row) => row.rowType)).toEqual(['?', '+', '', 'R']);
    expect(grouped?.rows[3]?.price).toBe('54');
  });

  it('turns the system rows of one system into a note on top', () => {
    const rows = [
      ...docRows(),
      toRowValues({ description: '7 Impianto sede', rowType: 'I', referenceId: '7|13', referenceYear: '1|2025' }),
    ];
    const grouped = groupSystems(rows, () => 'Via Roma 1');
    expect(grouped?.kind).toBe('system');
    expect(grouped?.rows[0]).toMatchObject({ rowType: 'N', text: '7 Impianto sede' });
    expect(grouped?.rows.filter((row) => row.rowType === 'I')).toEqual([]);
  });

  it('uses the destination address when the systems differ on the same destination', () => {
    const rows = [
      ...docRows(),
      toRowValues({ description: '8 Magazzino', rowType: 'I', referenceId: '8|13', referenceYear: '1|2025' }),
    ];
    expect(groupSystems(rows, (destination) => (destination === '1' ? 'Via Roma 1' : ''))?.rows[0]?.text).toBe(
      'Via Roma 1',
    );
    expect(groupSystems(docRows(), () => 'x')).toBeNull();
  });
});
