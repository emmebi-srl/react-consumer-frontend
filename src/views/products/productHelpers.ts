import { RouteConfig } from '~/routes/routeConfig';
import { ProductPriceListEntry } from '~/types/aries-proxy/products';

// Product codes are free text in the Delphi app (e.g. "1303131**"), so they must be URL-encoded.
// useParams() already returns the decoded value.
export const buildProductDetailLink = (productCode: string) =>
  RouteConfig.ProductDetail.buildLink({ productCode: encodeURIComponent(productCode) });

export type MarginMode = 'markup' | 'discount';

// "%" column of the Delphi "Listino" grid. The internal row follows the Ricarico/Sconto toggle
// ((price - cost) / cost vs (price - cost) / price); supplier rows always use the discount
// formula, and brand rows have no cost.
export const getPriceListEntryMargin = (entry: ProductPriceListEntry, mode: MarginMode) => {
  const { price, cost } = entry;
  if (price == null || cost == null || entry.type === 'brand') return null;

  const base = entry.type === 'internal' && mode === 'markup' ? cost : price;
  if (!base) return null;
  return ((price - cost) / base) * 100;
};
