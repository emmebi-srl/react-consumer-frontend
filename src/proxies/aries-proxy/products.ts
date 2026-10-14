import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getBrands,
  getMeasurementUnits,
  getProductCategories,
  getProductStatuses,
  getProductSubcategories,
  getProductionCostTypes,
  getProductsMetadata,
  searchProducts,
} from './api/products';
import { ProductSearchRequest } from '~/types/aries-proxy/products';

const ProductSearchPageSize = 50;

export const ProductsQueryKeys = {
  all: ['Products'] as const,
  search: (params: ProductSearchRequest) => ['Products', 'search', params] as const,
  metadata: (params: ProductSearchRequest) => ['Products', 'metadata', params] as const,
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
