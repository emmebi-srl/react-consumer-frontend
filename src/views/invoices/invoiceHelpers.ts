import { DdtDestination } from '~/types/aries-proxy/ddts';
import { InvoiceDocument, InvoiceRow } from '~/types/aries-proxy/invoices';
import { decodeRtf } from '~/utils/rtf-utils';

/** Delphi writes the descriptions of product and note rows (and sometimes the annotations) as RTF. */
export const toText = (value?: string | null) => {
  if (!value) return '';
  return value.trimStart().startsWith('{\\rtf') ? decodeRtf(value) : value;
};

export const formatDestination = (destination?: DdtDestination | null) => {
  if (!destination) return '';
  const street = [destination.street, destination.houseNumber].filter(Boolean).join(' ');
  const town = [destination.postalCode, destination.municipality].filter(Boolean).join(' ');
  return [street, destination.province ? `${town} (${destination.province})` : town].filter(Boolean).join(', ');
};

const DOCUMENT_LABELS: Record<InvoiceDocument['type'], string> = {
  report: 'Rapporto',
  ddt: 'DDT',
  report_group: 'Resoconto',
};

export const invoiceDocumentLabel = (document: InvoiceDocument) =>
  `${DOCUMENT_LABELS[document.type]} ${document.number || document.id}/${document.year}`;

/** Delphi SimpleRoundTo(x, -2): halves away from zero. */
export const roundCents = (value: number) => {
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * 100 + 1e-9)) / 100;
};

/** TInvoiceProduct.TaxableRowAmount: price less discount % times quantity, rounded to cents. */
export const rowTaxableAmount = (row: Pick<InvoiceRow, 'price' | 'discount' | 'quantity'>) =>
  roundCents(((row.price ?? 0) / 100) * (100 - (row.discount ?? 0)) * (row.quantity ?? 0));
