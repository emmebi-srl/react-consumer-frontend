import ariesServicesClient from '~/clients/aries-services-client';
import {
  QuoteCreate,
  QuoteItemCreate,
  QuoteItemUpdate,
  QuoteList,
  QuoteStatusList,
  QuoteTypeList,
  QuoteLotCreate,
  QuoteLotUpdate,
  QuoteRevisionCreate,
  QuoteRevisionUpdate,
  QuoteSearchRequest,
  QuoteUpdate,
  QuoteRevisionList,
  QuoteLotList,
  QuoteItemList,
} from '~/types/aries-proxy/quotes';
import { SearchMetadata } from '~/types/aries-proxy/shared';

export const getQuotes = (req: QuoteSearchRequest) => {
  return ariesServicesClient.get<QuoteList>('quote', { params: req });
};

export const getQuotesMetadata = (req: QuoteSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('quote/metadata', { params: req });
};

export const getQuoteById = (year: number, id: number, options?: { includes?: string }) => {
  return ariesServicesClient.get<QuoteList>(`quote/${year}/${id}`, { params: options });
};

export const getQuoteStatuses = () => {
  return ariesServicesClient.get<QuoteStatusList>('quote/status');
};

export const getQuoteTypes = () => {
  return ariesServicesClient.get<QuoteTypeList>('quote/type');
};

export const createQuote = (model: QuoteCreate) => {
  return ariesServicesClient.post<QuoteList>('quote', model);
};

export const updateQuote = (year: number, id: number, model: QuoteUpdate) => {
  return ariesServicesClient.patch<QuoteList>(`quote/${year}/${id}`, model);
};

export const getQuoteRevisions = (year: number, id: number) => {
  return ariesServicesClient.get<QuoteRevisionList>(`quote/${year}/${id}/revisions`);
};

export const getQuoteRevisionById = (year: number, id: number, revisionId: number) => {
  return ariesServicesClient.get<QuoteRevisionList>(`quote/${year}/${id}/revisions/${revisionId}`);
};

export const createQuoteRevision = (year: number, id: number, model: QuoteRevisionCreate) => {
  return ariesServicesClient.post<QuoteRevisionList>(`quote/${year}/${id}/revisions`, model);
};

export const updateQuoteRevision = (year: number, id: number, revisionId: number, model: QuoteRevisionUpdate) => {
  return ariesServicesClient.patch<QuoteRevisionList>(`quote/${year}/${id}/revisions/${revisionId}`, model);
};

export const getQuoteLots = (year: number, id: number, revisionId: number) => {
  return ariesServicesClient.get<QuoteLotList>(`quote/${year}/${id}/revisions/${revisionId}/lots`);
};

export const getQuoteLotById = (year: number, id: number, revisionId: number, position: number) => {
  return ariesServicesClient.get<QuoteLotList>(`quote/${year}/${id}/revisions/${revisionId}/lots/${position}`);
};

export const createQuoteLot = (year: number, id: number, revisionId: number, model: QuoteLotCreate) => {
  return ariesServicesClient.post<QuoteLotList>(`quote/${year}/${id}/revisions/${revisionId}/lots`, model);
};

export const updateQuoteLot = (
  year: number,
  id: number,
  revisionId: number,
  position: number,
  model: QuoteLotUpdate,
) => {
  return ariesServicesClient.patch<QuoteLotList>(`quote/${year}/${id}/revisions/${revisionId}/lots/${position}`, model);
};

export const getQuoteItems = (year: number, id: number, revisionId: number, position: number) => {
  return ariesServicesClient.get<QuoteItemList>(`quote/${year}/${id}/revisions/${revisionId}/lots/${position}/items`);
};

export const getQuoteItemById = (year: number, id: number, revisionId: number, position: number, tabId: number) => {
  return ariesServicesClient.get<QuoteItemList>(
    `quote/${year}/${id}/revisions/${revisionId}/lots/${position}/items/${tabId}`,
  );
};

export const createQuoteItem = (
  year: number,
  id: number,
  revisionId: number,
  position: number,
  model: QuoteItemCreate,
) => {
  return ariesServicesClient.post<QuoteItemList>(
    `quote/${year}/${id}/revisions/${revisionId}/lots/${position}/items`,
    model,
  );
};

export const updateQuoteItem = (
  year: number,
  id: number,
  revisionId: number,
  position: number,
  tabId: number,
  model: QuoteItemUpdate,
) => {
  return ariesServicesClient.patch<QuoteItemList>(
    `quote/${year}/${id}/revisions/${revisionId}/lots/${position}/items/${tabId}`,
    model,
  );
};
