import ariesServicesClient from '~/clients/aries-services-client';
import {
  BankBranchList,
  EInvoice,
  InvoiceAvailableDocumentList,
  InvoiceImportRequest,
  InvoiceImportResult,
  InvoiceCustomerDefaults,
  InvoiceEditorDefaults,
  InvoiceFlagsRequest,
  InvoiceList,
  InvoiceLookups,
  InvoiceProductDefaults,
  InvoiceSaveRequest,
  InvoiceSearchRequest,
  InvoiceSettings,
  InvoiceTotals,
  SdICoopStatus,
} from '~/types/aries-proxy/invoices';
import { SearchMetadata } from '~/types/aries-proxy/shared';

/** Archived PDF of the Delphi client (dashboard). */
export const getInvoicePdf = (year: number, id: number) =>
  ariesServicesClient.get<Blob>(`invoice/${year}/${id}/pdf`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });

/** Newest first, by invoice date. */
export const searchInvoices = (req?: InvoiceSearchRequest) => {
  return ariesServicesClient.get<InvoiceList>('invoice', { params: req });
};

export const getInvoicesMetadata = (req?: InvoiceSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('invoice/metadata', { params: req });
};

/** Requires the totals permission of the invoices module. */
export const getInvoicesTotals = (req?: InvoiceSearchRequest) => {
  return ariesServicesClient.get<InvoiceTotals>('invoice/totals', { params: req });
};

export const getInvoiceLookups = () => {
  return ariesServicesClient.get<InvoiceLookups>('invoice/lookups');
};

export const getInvoiceEditorDefaults = () => {
  return ariesServicesClient.get<InvoiceEditorDefaults>('invoice/editor-defaults');
};

/** Query params are not mapped by the client: the keys are the ones the API binds. */
export const getInvoiceCustomerDefaults = (customerId: number, invoiceDate?: string) => {
  return ariesServicesClient.get<InvoiceCustomerDefaults>(`invoice/customer-defaults/${customerId}`, {
    params: { invoiceDate: invoiceDate || undefined },
  });
};

export const searchInvoiceBanks = (search: string, companyBanks: boolean) => {
  return ariesServicesClient.get<BankBranchList>('invoice/banks', {
    params: { search: search || undefined, companyBanks },
  });
};

/** Net price for the customer and internal cost of a new product row. */
export const getInvoiceProductDefaults = (productCode: string, customerId?: number | null) => {
  return ariesServicesClient.get<InvoiceProductDefaults>('invoice/product-defaults', {
    params: { productCode, customerId: customerId ?? undefined },
  });
};

export const getInvoiceById = (year: number, id: number, includes?: string) => {
  return ariesServicesClient.get<InvoiceList>(`invoice/${year}/${id}`, { params: { includes } });
};

export const createInvoice = (data: InvoiceSaveRequest) => {
  return ariesServicesClient.post<InvoiceList>('invoice', data);
};

/** A different invoiceId, or a date in another year, renumbers the invoice: the response has the new key. */
export const saveInvoice = (year: number, id: number, data: InvoiceSaveRequest) => {
  return ariesServicesClient.put<InvoiceList>(`invoice/${year}/${id}`, data);
};

export const deleteInvoice = (year: number, id: number) => {
  return ariesServicesClient.delete(`invoice/${year}/${id}`);
};

/** The copy is a new preinvoice. */
export const cloneInvoice = (year: number, id: number) => {
  return ariesServicesClient.post<InvoiceList>(`invoice/${year}/${id}/clone`);
};

/** invoiceDate null keeps the preinvoice date. */
export const promoteInvoice = (preinvoiceId: number, invoiceDate: string | null) => {
  return ariesServicesClient.post<InvoiceList>(`invoice/0/${preinvoiceId}/promote`, { invoiceDate });
};

export const setInvoiceFlags = (year: number, id: number, data: InvoiceFlagsRequest) => {
  return ariesServicesClient.patch<InvoiceList>(`invoice/${year}/${id}/flags`, data);
};

export const getInvoiceSettings = () => {
  return ariesServicesClient.get<InvoiceSettings>('invoice/settings');
};

export const saveInvoiceSettings = (data: InvoiceSettings) => {
  return ariesServicesClient.put<InvoiceSettings>('invoice/settings', data);
};

/** SDICoop channel: is the service running and until when its certificate is valid. */
export const getSdICoopStatus = () => {
  return ariesServicesClient.get<SdICoopStatus>('invoice/sdicoop-status');
};

/** Courtesy PDF generated now (the "pdf" action returns the one archived by Delphi). */
export const printInvoice = (year: number, id: number) => {
  return ariesServicesClient.get<ArrayBuffer>(`invoice/${year}/${id}/print`, { responseType: 'arraybuffer' });
};

/** Writes the XML in the invoice folder too, like Delphi. */
export const createEInvoice = (year: number, id: number, attachDdts: boolean) => {
  return ariesServicesClient.post<EInvoice>(`invoice/${year}/${id}/einvoice`, undefined, { params: { attachDdts } });
};

/** Reports, DDTs and report groups still to invoice, of the customer when given. */
export const getInvoiceAvailableDocuments = (customerId?: number | null) => {
  return ariesServicesClient.get<InvoiceAvailableDocumentList>('invoice/available-documents', {
    params: { customerId: customerId ?? undefined },
  });
};

/** Rows of a document for the editor: nothing is saved until the invoice is. */
export const importInvoiceDocument = (data: InvoiceImportRequest) => {
  return ariesServicesClient.post<InvoiceImportResult>('invoice/import-document', data);
};
