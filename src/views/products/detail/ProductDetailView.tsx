import { useEffect, useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import BackButton from '~/components/Layout/BackButton';
import PageContainer from '~/components/Layout/PageContainer';
import useSnackbar from '~/hooks/useSnackbar';
import { useProductByCode, useSaveProduct } from '~/proxies/aries-proxy/products';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import ProductFormFields from '../form/ProductFormFields';
import {
  getProductFormValues,
  PRODUCT_DETAIL_INCLUDES,
  ProductFormValues,
  toProductSaveRequest,
} from '../form/productFormValues';
import useConfirmDuplicateCodes from '../form/useConfirmDuplicateCodes';
import ProductDetailActions from './components/ProductDetailActions';
import ProductDetailTables from './components/ProductDetailTables';
import ProductKitCard from './components/ProductKitCard';
import ProductPictureCard from './components/ProductPictureCard';

const ProductDetailView = () => {
  const params = useParams<{ productCode?: string }>();
  const productCode = params.productCode ?? '';

  const productQuery = useProductByCode(productCode, { includes: PRODUCT_DETAIL_INCLUDES });
  const product = productQuery.data?.products.at(0);
  const saveMutation = useSaveProduct();
  const snackbar = useSnackbar();
  const confirmDuplicateCodes = useConfirmDuplicateCodes();

  const defaultValues = useMemo(() => getProductFormValues(product), [product]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { dirtyFields, isDirty, isSubmitting },
  } = useForm<ProductFormValues>({ values: defaultValues, resetOptions: { keepDirtyValues: true } });

  // Reset the "keep dirty on reload" baseline once the initial data has arrived.
  useEffect(() => {
    if (product) reset(defaultValues, { keepDirtyValues: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.productCode]);

  const onSubmit = async (values: ProductFormValues) => {
    if (!product) return;
    // Only codes changed in this edit are checked, like the Delphi client.
    const confirmed = await confirmDuplicateCodes(
      {
        barcode: dirtyFields.barcode ? values.barcode : undefined,
        supplierProductCode: dirtyFields.supplierProductCode ? values.supplierProductCode : undefined,
      },
      product.productCode,
    );
    if (!confirmed) return;

    try {
      await saveMutation.mutateAsync({
        productCode: product.productCode,
        data: toProductSaveRequest(values, !!dirtyFields.extendedDescription),
      });
      snackbar.success('Articolo salvato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile salvare l'articolo"));
    }
  };

  return (
    <PageContainer>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} sx={{ pb: isDirty ? 10 : 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
            <BackButton to={RouteConfig.ProductList.buildLink()} />
            <Typography variant="h4" noWrap>
              {product ? `${product.productCode} · ${product.description ?? ''}` : productCode}
            </Typography>
            {product?.productStatus && (
              <DelphiColorChip label={product.productStatus.name} delphiColor={product.productStatus.color} />
            )}
            {product?.isKit && <Chip size="small" color="info" label="Composto" />}
          </Stack>
          {product && <ProductDetailActions productCode={product.productCode} hasUnsavedChanges={isDirty} />}
        </Stack>

        {productQuery.isSuccess && !product && (
          <Typography sx={{ color: 'text.secondary' }}>Articolo non trovato.</Typography>
        )}

        {product && (
          <Stack spacing={2}>
            <ProductFormFields product={product} control={control} dirtyFields={dirtyFields} setValue={setValue} />
            <Box sx={{ maxWidth: { lg: 420 } }}>
              <ProductPictureCard productCode={product.productCode} />
            </Box>
            {product.isKit && <ProductKitCard product={product} />}
            <ProductDetailTables product={product} />
          </Stack>
        )}

        {isDirty && (
          <FormSaveBar
            saving={isSubmitting || saveMutation.isPending}
            cancelLabel="Annulla modifiche"
            submitLabel="Salva modifiche"
            onCancel={() => reset(defaultValues)}
          />
        )}
      </Stack>
    </PageContainer>
  );
};

export default ProductDetailView;
