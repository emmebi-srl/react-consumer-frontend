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
  productStatus?: ProductStatus;
  productBrand?: Brand;
  category?: ProductCategory;
  subcategory?: ProductSubcategory;
  measurementUnit?: MeasurementUnit;
  productionCostType?: ProductionCostType;
  supplier?: Supplier;
}

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
