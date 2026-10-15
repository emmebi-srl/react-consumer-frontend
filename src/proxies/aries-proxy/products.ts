import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  getBrands,
  getProductByCode,
  getProductSubcategoriesLevel2,
  saveProduct,
  getMeasurementUnits,
  getProductCategories,
  getProductStatuses,
  getProductSubcategories,
  getProductionCostTypes,
  getProductsMetadata,
  searchProducts,
} from './api/products';
import { ProductSaveRequest, ProductSearchRequest } from '~/types/aries-proxy/products';

const ProductSearchPageSize = 50;

export const ProductsQueryKeys = {
  all: ['Products'] as const,
  search: (params: ProductSearchRequest) => ['Products', 'search', params] as const,
  metadata: (params: ProductSearchRequest) => ['Products', 'metadata', params] as const,
  byCode: (productCode: string, includes?: string) => ['Products', 'byCode', productCode, includes] as const,
  subcategoriesLevel2: (subcategoryId?: number) => ['ProductSubcategoriesLevel2', subcategoryId] as const,
  statuses: ['ProductStatuses'] as const,
  brands: ['Brands'] as const,
  categories: ['ProductCategories'] as const,
  subcategories: (categoryId?: number) => ['ProductSubcategories', categoryId] as const,
  measurementUnits: ['MeasurementUnits'] as const,
  productionCostTypes: ['ProductionCostTypes'] as const,
};

export const useProductsSearch = (params: ProductSearchRequest) => {
  return useInfiniteQuery({
    queryKey: ProductsQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = params.pageSize ?? ProductSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const res = await searchProducts({
        ...params,
        pageIndex,
        pageSize,
      });
      return {
        ...res.data,
        pageParam: {
          pageIndex,
          pageSize,
        },
      };
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      if (data.products.length < (params.pageSize ?? ProductSearchPageSize)) {
        return undefined;
      }

      const args = data.pageParam;
      return (Number(args.pageIndex) + 1).toString();
    },
  });
};

export const useProductsMetadata = (params: ProductSearchRequest) => {
  return useQuery({
    queryKey: ProductsQueryKeys.metadata(params),
    queryFn: async () => (await getProductsMetadata(params)).data,
  });
};

export const useProductByCode = (productCode: string, options?: { includes?: string }) => {
  return useQuery({
    queryKey: ProductsQueryKeys.byCode(productCode, options?.includes),
    queryFn: async () => (await getProductByCode(productCode, options)).data,
    enabled: !!productCode,
  });
};

export const useSaveProduct = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productCode, data }: { productCode: string; data: ProductSaveRequest }) =>
      (await saveProduct(productCode, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ProductsQueryKeys.all }),
  });
};

// Products matching exactly a barcode or supplier code (used to warn about duplicates before saving).
export const findProductsByExactCode = async (filter: { barcode?: string; supplierProductCode?: string }) => {
  const res = await searchProducts({ ...filter, pageIndex: 1, pageSize: 10 });
  return res.data.products;
};

export const useProductSubcategoriesLevel2 = (subcategoryId?: number) => {
  return useQuery({
    queryKey: ProductsQueryKeys.subcategoriesLevel2(subcategoryId),
    queryFn: async () => (await getProductSubcategoriesLevel2(subcategoryId)).data,
    enabled: subcategoryId !== undefined,
  });
};

export const useProductStatuses = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.statuses,
    queryFn: async () => (await getProductStatuses()).data,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.brands,
    queryFn: async () => (await getBrands()).data,
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.categories,
    queryFn: async () => (await getProductCategories()).data,
  });
};

export const useProductSubcategories = (categoryId?: number) => {
  return useQuery({
    queryKey: ProductsQueryKeys.subcategories(categoryId),
    queryFn: async () => (await getProductSubcategories(categoryId)).data,
    enabled: categoryId !== undefined,
  });
};

export const useMeasurementUnits = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.measurementUnits,
    queryFn: async () => (await getMeasurementUnits()).data,
  });
};

export const useProductionCostTypes = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.productionCostTypes,
    queryFn: async () => (await getProductionCostTypes()).data,
  });
};
