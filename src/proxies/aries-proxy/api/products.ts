import ariesServicesClient from '~/clients/aries-services-client';
import { SearchMetadata } from '~/types/aries-proxy/shared';
import {
  BrandList,
  MeasurementUnitList,
  ProductCategoryList,
  ProductCodeSaveRequest,
  ProductCreateRequest,
  ProductLinkedProductKind,
  ProductLinkedProductSaveRequest,
  ProductNoteSaveRequest,
  ProductOperationSaveRequest,
  ProductOperationTypeList,
  ProductRegulationCreateRequest,
  RegulationList,
  ProductList,
  ProductSaveRequest,
  ProductSearchRequest,
  ProductSubcategoryLevel2List,
  ProductStatus,
  ProductSubcategoryList,
  ProductionCostTypeList,
} from '~/types/aries-proxy/products';

// Product codes are free text (e.g. "1303131**"): always URL-encode them.
const productPath = (productCode: string) => `product/${encodeURIComponent(productCode)}`;

export const searchProducts = (req: ProductSearchRequest) => {
  return ariesServicesClient.get<ProductList>('product/new', { params: req });
};

export const getProductsMetadata = (req: ProductSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('product/new/metadata', { params: req });
};

export const getProductByCode = (productCode: string, options?: { includes?: string }) => {
  return ariesServicesClient.get<ProductList>(productPath(productCode), { params: options });
};

export const saveProduct = (productCode: string, model: ProductSaveRequest) => {
  return ariesServicesClient.put<ProductList>(productPath(productCode), model);
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

export const createProduct = (model: ProductCreateRequest) => {
  return ariesServicesClient.post<ProductList>('product', model);
};

export const deleteProduct = (productCode: string) => {
  return ariesServicesClient.delete(productPath(productCode));
};

export const cloneProduct = (productCode: string) => {
  return ariesServicesClient.post<ProductList>(`${productPath(productCode)}/clone`);
};

// Binary responses are requested as ArrayBuffer: the client response interceptor leaves them untouched.
export const getProductPicture = (productCode: string) => {
  return ariesServicesClient.get<ArrayBuffer>(`${productPath(productCode)}/picture`, { responseType: 'arraybuffer' });
};

export const uploadProductPicture = (productCode: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return ariesServicesClient.post(`${productPath(productCode)}/picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteProductPicture = (productCode: string) => {
  return ariesServicesClient.delete(`${productPath(productCode)}/picture`);
};

// Same label the Android app prints (JPEG). Query keys are snake_case: params are not mapped by the client.
export const getProductLabel = (productCode: string, size: { width: number; height: number }) => {
  return ariesServicesClient.get<ArrayBuffer>(`${productPath(productCode)}/label`, {
    params: { label_width: size.width, label_height: size.height },
    responseType: 'arraybuffer',
  });
};

export const addProductCode = (productCode: string, model: ProductCodeSaveRequest) => {
  return ariesServicesClient.post<ProductList>(`${productPath(productCode)}/codes`, model);
};

export const updateProductCode = (productCode: string, code: string, model: ProductCodeSaveRequest) => {
  return ariesServicesClient.put<ProductList>(`${productPath(productCode)}/codes`, model, { params: { code } });
};

export const deleteProductCode = (productCode: string, code: string) => {
  return ariesServicesClient.delete<ProductList>(`${productPath(productCode)}/codes`, { params: { code } });
};

export const addProductNote = (productCode: string, model: ProductNoteSaveRequest) => {
  return ariesServicesClient.post<ProductList>(`${productPath(productCode)}/notes`, model);
};

export const updateProductNote = (productCode: string, description: string, model: ProductNoteSaveRequest) => {
  return ariesServicesClient.put<ProductList>(`${productPath(productCode)}/notes`, model, { params: { description } });
};

export const deleteProductNote = (productCode: string, description: string) => {
  return ariesServicesClient.delete<ProductList>(`${productPath(productCode)}/notes`, { params: { description } });
};

export const addProductRegulation = (productCode: string, model: ProductRegulationCreateRequest) => {
  return ariesServicesClient.post<ProductList>(`${productPath(productCode)}/regulations`, model);
};

export const deleteProductRegulation = (productCode: string, regulationId: number) => {
  return ariesServicesClient.delete<ProductList>(`${productPath(productCode)}/regulations/${regulationId}`);
};

export const addProductLinkedProduct = (
  productCode: string,
  kind: ProductLinkedProductKind,
  model: ProductLinkedProductSaveRequest,
) => {
  return ariesServicesClient.post<ProductList>(`${productPath(productCode)}/${kind}`, model);
};

export const updateProductLinkedProduct = (
  productCode: string,
  kind: ProductLinkedProductKind,
  code: string,
  model: ProductLinkedProductSaveRequest,
) => {
  return ariesServicesClient.put<ProductList>(`${productPath(productCode)}/${kind}`, model, { params: { code } });
};

export const deleteProductLinkedProduct = (productCode: string, kind: ProductLinkedProductKind, code: string) => {
  return ariesServicesClient.delete<ProductList>(`${productPath(productCode)}/${kind}`, { params: { code } });
};

export const addProductOperation = (productCode: string, model: ProductOperationSaveRequest) => {
  return ariesServicesClient.post<ProductList>(`${productPath(productCode)}/operations`, model);
};

export const updateProductOperation = (
  productCode: string,
  operationId: number,
  model: ProductOperationSaveRequest,
) => {
  return ariesServicesClient.put<ProductList>(`${productPath(productCode)}/operations/${operationId}`, model);
};

export const deleteProductOperation = (productCode: string, operationId: number) => {
  return ariesServicesClient.delete<ProductList>(`${productPath(productCode)}/operations/${operationId}`);
};

export const getRegulations = () => {
  return ariesServicesClient.get<RegulationList>('product/regulation');
};

export const getProductOperationTypes = () => {
  return ariesServicesClient.get<ProductOperationTypeList>('product/operation-type');
};
