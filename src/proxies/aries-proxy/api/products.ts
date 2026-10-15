import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  BrandList,
  MeasurementUnitList,
  ProductCategoryList,
  ProductList,
  ProductSaveRequest,
  ProductSearchRequest,
  ProductSubcategoryLevel2List,
  ProductStatus,
  ProductSubcategoryList,
  ProductionCostTypeList,
} from '~/types/aries-proxy/products';

export const searchProducts = (req: ProductSearchRequest) => {
  return ariesServicesClient.get<ProductList>('product/new', { params: req });
};

export const getProductsMetadata = (req: ProductSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('product/new/metadata', { params: req });
};

export const getProductByCode = (productCode: string, options?: { includes?: string }) => {
  return ariesServicesClient.get<ProductList>(`product/${encodeURIComponent(productCode)}`, { params: options });
};

export const saveProduct = (productCode: string, model: ProductSaveRequest) => {
  return ariesServicesClient.put<ProductList>(`product/${encodeURIComponent(productCode)}`, model);
};

export const getProductSubcategoriesLevel2 = (subcategoryId?: number) => {
  return ariesServicesClient.get<ProductSubcategoryLevel2List>('product/subcategory-level2', {
    params: { subcategoryId },
  });
};

export const getProductStatuses = () => {
  return ariesServicesClient.get<ProductStatus[]>('product/status');
};

export const getBrands = () => {
  return ariesServicesClient.get<BrandList>('product/brand');
};

export const getProductCategories = () => {
  return ariesServicesClient.get<ProductCategoryList>('product/category');
};

export const getProductSubcategories = (categoryId?: number) => {
  return ariesServicesClient.get<ProductSubcategoryList>('product/subcategory', { params: { categoryId } });
};

export const getMeasurementUnits = () => {
  return ariesServicesClient.get<MeasurementUnitList>('product/measurement-unit');
};

export const getProductionCostTypes = () => {
  return ariesServicesClient.get<ProductionCostTypeList>('product/production-cost-type');
};
