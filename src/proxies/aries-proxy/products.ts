import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import {
  addProductCode,
  addProductLinkedProduct,
  addProductNote,
  addProductOperation,
  addProductRegulation,
  cloneProduct,
  createProduct,
  deleteProduct,
  deleteProductCode,
  deleteProductLinkedProduct,
  deleteProductNote,
  deleteProductOperation,
  deleteProductPicture,
  deleteProductRegulation,
  getBrands,
  getProductByCode,
  getProductLabel,
  getProductOperationTypes,
  getProductPicture,
  getProductSubcategoriesLevel2,
  getRegulations,
  saveProduct,
  getMeasurementUnits,
  getProductCategories,
  getProductStatuses,
  getProductSubcategories,
  getProductionCostTypes,
  getProductsMetadata,
  searchProducts,
  updateProductCode,
  updateProductLinkedProduct,
  updateProductNote,
  updateProductOperation,
  uploadProductPicture,
} from './api/products';
import {
  ProductCodeSaveRequest,
  ProductCreateRequest,
  ProductLinkedProductKind,
  ProductLinkedProductSaveRequest,
  ProductNoteSaveRequest,
  ProductOperationSaveRequest,
  ProductRegulationCreateRequest,
  ProductSaveRequest,
  ProductSearchRequest,
} from '~/types/aries-proxy/products';

const ProductSearchPageSize = 50;

// Same size the Android app requests (WarehouseProductEditorFragment).
const ProductLabelSize = { width: 900, height: 290 };

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
  // Under 'Products' so product mutations refresh it too.
  picture: (productCode: string) => ['Products', 'picture', productCode] as const,
  regulations: ['Regulations'] as const,
  operationTypes: ['ProductOperationTypes'] as const,
  autocomplete: (search: string) => ['Products', 'autocomplete', search] as const,
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

// Mutations of the product and of its detail tables: every product query is refreshed on success.
const useProductMutation = <TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onError: (err, variables) => exceptionLogger.captureException(err, { extra: { variables } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ProductsQueryKeys.all }),
  });
};

export const useCreateProduct = () =>
  useProductMutation(async (data: ProductCreateRequest) => (await createProduct(data)).data);

export const useDeleteProduct = () => useProductMutation((productCode: string) => deleteProduct(productCode));

export const useCloneProduct = () =>
  useProductMutation(async (productCode: string) => (await cloneProduct(productCode)).data);

// null when the product has no picture (404).
export const useProductPicture = (productCode: string) => {
  return useQuery({
    queryKey: ProductsQueryKeys.picture(productCode),
    queryFn: async () => {
      try {
        const res = await getProductPicture(productCode);
        return new Blob([res.data], { type: 'image/jpeg' });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!productCode,
  });
};

export const useUploadProductPicture = () =>
  useProductMutation(({ productCode, file }: { productCode: string; file: File }) =>
    uploadProductPicture(productCode, file),
  );

export const useDeleteProductPicture = () =>
  useProductMutation((productCode: string) => deleteProductPicture(productCode));

// Label of the Delphi/Android client, as a JPEG blob (opened in a new tab to print it).
export const fetchProductLabel = async (productCode: string) => {
  const res = await getProductLabel(productCode, ProductLabelSize);
  return new Blob([res.data], { type: 'image/jpeg' });
};

export const useAddProductCode = () =>
  useProductMutation(
    async ({ productCode, data }: { productCode: string; data: ProductCodeSaveRequest }) =>
      (await addProductCode(productCode, data)).data,
  );

export const useUpdateProductCode = () =>
  useProductMutation(
    async ({ productCode, code, data }: { productCode: string; code: string; data: ProductCodeSaveRequest }) =>
      (await updateProductCode(productCode, code, data)).data,
  );

export const useDeleteProductCode = () =>
  useProductMutation(
    async ({ productCode, code }: { productCode: string; code: string }) =>
      (await deleteProductCode(productCode, code)).data,
  );

export const useAddProductNote = () =>
  useProductMutation(
    async ({ productCode, data }: { productCode: string; data: ProductNoteSaveRequest }) =>
      (await addProductNote(productCode, data)).data,
  );

export const useUpdateProductNote = () =>
  useProductMutation(
    async ({
      productCode,
      description,
      data,
    }: {
      productCode: string;
      description: string;
      data: ProductNoteSaveRequest;
    }) => (await updateProductNote(productCode, description, data)).data,
  );

export const useDeleteProductNote = () =>
  useProductMutation(
    async ({ productCode, description }: { productCode: string; description: string }) =>
      (await deleteProductNote(productCode, description)).data,
  );

export const useAddProductRegulation = () =>
  useProductMutation(
    async ({ productCode, data }: { productCode: string; data: ProductRegulationCreateRequest }) =>
      (await addProductRegulation(productCode, data)).data,
  );

export const useDeleteProductRegulation = () =>
  useProductMutation(
    async ({ productCode, regulationId }: { productCode: string; regulationId: number }) =>
      (await deleteProductRegulation(productCode, regulationId)).data,
  );

export const useAddProductLinkedProduct = () =>
  useProductMutation(
    async ({
      productCode,
      kind,
      data,
    }: {
      productCode: string;
      kind: ProductLinkedProductKind;
      data: ProductLinkedProductSaveRequest;
    }) => (await addProductLinkedProduct(productCode, kind, data)).data,
  );

export const useUpdateProductLinkedProduct = () =>
  useProductMutation(
    async ({
      productCode,
      kind,
      code,
      data,
    }: {
      productCode: string;
      kind: ProductLinkedProductKind;
      code: string;
      data: ProductLinkedProductSaveRequest;
    }) => (await updateProductLinkedProduct(productCode, kind, code, data)).data,
  );

export const useDeleteProductLinkedProduct = () =>
  useProductMutation(
    async ({ productCode, kind, code }: { productCode: string; kind: ProductLinkedProductKind; code: string }) =>
      (await deleteProductLinkedProduct(productCode, kind, code)).data,
  );

export const useAddProductOperation = () =>
  useProductMutation(
    async ({ productCode, data }: { productCode: string; data: ProductOperationSaveRequest }) =>
      (await addProductOperation(productCode, data)).data,
  );

export const useUpdateProductOperation = () =>
  useProductMutation(
    async ({
      productCode,
      operationId,
      data,
    }: {
      productCode: string;
      operationId: number;
      data: ProductOperationSaveRequest;
    }) => (await updateProductOperation(productCode, operationId, data)).data,
  );

export const useDeleteProductOperation = () =>
  useProductMutation(
    async ({ productCode, operationId }: { productCode: string; operationId: number }) =>
      (await deleteProductOperation(productCode, operationId)).data,
  );

export const useRegulations = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.regulations,
    queryFn: async () => (await getRegulations()).data,
  });
};

export const useProductOperationTypes = () => {
  return useQuery({
    queryKey: ProductsQueryKeys.operationTypes,
    queryFn: async () => (await getProductOperationTypes()).data,
  });
};

// Product picker (spare parts / equipment): first 20 matches, only after 2 typed characters.
export const useProductsAutocomplete = (searchText: string) => {
  const search = searchText.trim();
  return useQuery({
    queryKey: ProductsQueryKeys.autocomplete(search),
    queryFn: async () => (await searchProducts({ search, pageIndex: 1, pageSize: 20 })).data.products,
    enabled: search.length >= 2,
  });
};
