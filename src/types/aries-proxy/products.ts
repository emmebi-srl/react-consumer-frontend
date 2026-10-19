import { Supplier } from './suppliers';

export interface ProductStatus {
  id: number;
  name: string;
  isBlocked: boolean;
  // Raw Delphi color, only returned by the product_status include (convert with normalizeToHexColor).
  color?: string | null;
}

export interface Brand {
  id: string;
  name?: string | null;
  website?: string | null;
  email?: string | null;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string | null;
  movesWarehouse: boolean;
  movesSystem: boolean;
}

export interface ProductSubcategory {
  id: number;
  categoryId: number;
  name: string;
  description?: string | null;
}

export interface MeasurementUnit {
  id: string;
  name: string;
  description?: string | null;
}

export interface ProductionCostType {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  productCode: string;
  supplierProductCode?: string | null;
  description?: string | null;
  installationTime: number;
  status: number;
  measurementUnits?: string | null;
  barcode?: string | null;
  brandCode?: string | null;
  depotPositionDescription?: string | null;
  depotShelf?: string | null;
  depotShelfTier?: string | null;
  insertionDate: number;
  editDate: number;
  supplierId?: number | null;
  categoryId?: number | null;
  subcategoryId?: number | null;
  productionCostTypeId?: number | null;
  isKit?: boolean | null;
  expirationMonths?: number | null;
  warrantyMonths?: number | null;
  lastSalePrice?: number | null;
  subcategoryLevel2Id?: number | null;
  weight?: number | null;
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  humidity?: number | null;
  liters?: number | null;
  standbyAbsorption?: number | null;
  activeAbsorption?: number | null;
  multiplier?: number | null;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  packageQuantity?: number | null;
  maintenanceMinutes?: number | null;
  color?: string | null;
  modificationDate?: number | null;
  productStatus?: ProductStatus;
  productBrand?: Brand;
  category?: ProductCategory;
  subcategory?: ProductSubcategory;
  subcategoryLevel2?: ProductSubcategoryLevel2;
  measurementUnit?: MeasurementUnit;
  productionCostType?: ProductionCostType;
  supplier?: Supplier;
  // Detail includes (single product only).
  codes?: ProductCode[];
  spareParts?: ProductLinkedProduct[];
  equipment?: ProductLinkedProduct[];
  operations?: ProductOperation[];
  notes?: ProductNote[];
  // Raw Delphi RTF (articolo_nota 'GENERALE'): decode with decodeRtf from ~/utils/rtf-utils.
  extendedDescription?: string;
  regulations?: Regulation[];
  priceListEntries?: ProductPriceListEntry[];
  // Only for kits (isKit).
  kitComponents?: ProductKitComponent[];
}

export interface ProductSubcategoryLevel2 {
  id: number;
  subcategoryId: number;
  name: string;
  description?: string | null;
}

export interface ProductCode {
  code: string;
  supplierId?: number | null;
  supplier?: Supplier;
}

// Spare part / equipment row: another product linked to this one.
export interface ProductLinkedProduct {
  code: string;
  quantity?: number | null;
  description?: string | null;
  productDescription?: string | null;
  supplierProductCode?: string | null;
}

export interface ProductOperation {
  operationId: number;
  name?: string | null;
  description?: string | null;
}

export interface ProductNote {
  description: string;
  // Raw Delphi RTF.
  note?: string | null;
  editDate?: number | null;
}

export interface Regulation {
  id: number;
  name: string;
  description?: string | null;
  note?: string | null;
}

export type ProductPriceListEntryType = 'internal' | 'supplier' | 'brand';

export interface ProductPriceListEntry {
  type: ProductPriceListEntryType;
  name: string;
  priceListId?: number | null;
  price?: number | null;
  cost?: number | null;
  lastPrice?: number | null;
}

// Full editable state, sent with PUT product/new/{code}.
export interface ProductSaveRequest {
  description: string;
  barcode: string;
  supplierProductCode: string;
  brandCode: string | null;
  supplierId: number | null;
  status: number;
  productionCostTypeId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  subcategoryLevel2Id: number | null;
  measurementUnits: string | null;
  installationTime: number;
  maintenanceMinutes: number;
  expirationMonths: number;
  warrantyMonths: number;
  minQuantity: number;
  maxQuantity: number;
  packageQuantity: number;
  weight: number;
  height: number;
  width: number;
  depth: number;
  minTemperature: number;
  maxTemperature: number;
  humidity: number;
  liters: number;
  standbyAbsorption: number;
  activeAbsorption: number;
  multiplier: number;
  color: string | null;
  depotPositionDescription: string;
  depotShelf: string;
  depotShelfTier: string;
  // Raw RTF; omit to leave the extended description untouched.
  extendedDescription?: string;
}

export interface ProductSubcategoryLevel2List {
  subcategories: ProductSubcategoryLevel2[];
}

// POST product: empty/omitted productCode = automatic code.
export interface ProductCreateRequest extends ProductSaveRequest {
  isKit?: boolean;
  productCode?: string;
}

export interface ProductCodeSaveRequest {
  code: string;
  supplierId: number | null;
}

export interface ProductNoteSaveRequest {
  description: string;
  // Raw RTF (encodeRtfText).
  note: string;
}

export interface ProductRegulationCreateRequest {
  regulationId: number;
}

// Spare part / equipment. `code` (the linked product) is only used on create.
export interface ProductLinkedProductSaveRequest {
  code: string;
  quantity: number;
  description: string;
}

// `operationId` is only used on create.
export interface ProductOperationSaveRequest {
  operationId: number;
  description: string;
}

export interface RegulationList {
  regulations: Regulation[];
}

export interface ProductOperationType {
  id: number;
  name: string;
  description?: string | null;
}

export interface ProductOperationTypeList {
  operationTypes: ProductOperationType[];
}

export type ProductLinkedProductKind = 'spare-parts' | 'equipment';

export interface ProductList {
  products: Product[];
}

export interface ProductSearchRequest {
  search?: string;
  statusId?: number;
  brandId?: string;
  categoryId?: number;
  subcategoryId?: number;
  supplierId?: number;
  isKit?: boolean;
  // Exact matches.
  barcode?: string;
  supplierProductCode?: string;
  pageIndex?: number;
  pageSize?: number;
  includes?: string;
}

export interface BrandList {
  brands: Brand[];
}

export interface ProductCategoryList {
  categories: ProductCategory[];
}

export interface ProductSubcategoryList {
  subcategories: ProductSubcategory[];
}

export interface MeasurementUnitList {
  measurementUnits: MeasurementUnit[];
}

export interface ProductionCostTypeList {
  productionCostTypes: ProductionCostType[];
}

export interface ProductKitComponent {
  code: string;
  quantity: number;
  price: number;
  cost: number;
  // Installation time per unit.
  installationTime: number;
  position: number;
  description?: string | null;
  supplierProductCode?: string | null;
  measurementUnits?: string | null;
}

export interface ProductKitComponentSaveRequest {
  code: string;
  quantity: number;
  price: number;
  cost: number;
  installationTime: number;
}

export interface ProductKitComponentsSaveRequest {
  components: ProductKitComponentSaveRequest[];
  replaceExtendedDescription: boolean;
}

// Null values are left untouched. priceListId: supplier price list id / brand listino id, ignored for internal.
export interface ProductPricesSaveRequest {
  type: ProductPriceListEntryType;
  priceListId: number | null;
  price: number | null;
  cost: number | null;
  lastPrice: number | null;
}

export interface ProductPriceListLookupList {
  priceLists: ProductPriceListEntry[];
}

export interface ProductPriceChargeBand {
  fromCost: number;
  toCost: number;
  percentage: number;
}

export interface ProductPriceChargeRequest {
  bands: ProductPriceChargeBand[];
  onlyActive: boolean;
  skipZeroCost: boolean;
}

export interface ProductPriceChargeResult {
  updatedPrices: number;
}

export interface ProductPriceAnomaly {
  productCode: string;
  supplierProductCode?: string | null;
  description?: string | null;
  cost: number;
  price: number;
}

export interface ProductPriceAnomalyList {
  anomalies: ProductPriceAnomaly[];
}
