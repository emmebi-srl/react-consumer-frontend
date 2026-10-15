import { useEffect, useMemo } from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useParams } from 'react-router-dom';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { findProductsByExactCode, useProductByCode, useSaveProduct } from '~/proxies/aries-proxy/products';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import ProductFormFields from '../form/ProductFormFields';
import {
  getProductFormValues,
  PRODUCT_DETAIL_INCLUDES,
  ProductFormValues,
  toProductSaveRequest,
} from '../form/productFormValues';
import ProductDetailTables from './components/ProductDetailTables';

const ProductDetailView = () => {
  const params = useParams<{ productCode?: string }>();
  const productCode = params.productCode ?? '';

  const productQuery = useProductByCode(productCode, { includes: PRODUCT_DETAIL_INCLUDES });
  const product = productQuery.data?.products.at(0);
  const saveMutation = useSaveProduct();
  const modal = useModal();
  const snackbar = useSnackbar();

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

  // Like the Delphi client: a barcode / supplier code already used by another product is allowed,
  // but only after an explicit confirmation.
  const confirmDuplicates = async (values: ProductFormValues) => {
    const checks: { label: string; filter: { barcode?: string; supplierProductCode?: string } }[] = [];
    if (dirtyFields.barcode && values.barcode.trim())
      checks.push({ label: 'Barcode', filter: { barcode: values.barcode.trim() } });
    if (dirtyFields.supplierProductCode && values.supplierProductCode.trim())
      checks.push({ label: 'Codice fornitore', filter: { supplierProductCode: values.supplierProductCode.trim() } });

    for (const check of checks) {
      const duplicates = (await findProductsByExactCode(check.filter)).filter(
        (other) => other.productCode !== product?.productCode,
      );
      if (duplicates.length === 0) continue;

      const result = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: `${check.label} già utilizzato`,
          text: `${check.label} già presente su: ${duplicates.map((other) => other.productCode).join(', ')}. Salvare comunque?`,
          alertSeverity: 'warning',
        },
      });
      if (result.action !== 'YES') return false;
    }
    return true;
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!product) return;
    if (!(await confirmDuplicates(values))) return;

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
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography variant="h4" noWrap>
              {product ? `${product.productCode} · ${product.description ?? ''}` : productCode}
            </Typography>
            {product?.productStatus && (
              <DelphiColorChip label={product.productStatus.name} delphiColor={product.productStatus.color} />
            )}
            {product?.isKit && <Chip size="small" color="info" label="Composto" />}
          </Stack>
          <Typography
            component={RouterLink}
            to={RouteConfig.ProductList.buildLink()}
            color="primary"
            sx={{ textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            {'←'} Torna alla lista
          </Typography>
        </Stack>

        {productQuery.isSuccess && !product && (
          <Typography sx={{ color: 'text.secondary' }}>Articolo non trovato.</Typography>
        )}

        {product && (
          <Stack spacing={2}>
            <ProductFormFields product={product} control={control} dirtyFields={dirtyFields} setValue={setValue} />
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
