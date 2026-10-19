import { Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import useSnackbar from '~/hooks/useSnackbar';
import { useCreateProduct } from '~/proxies/aries-proxy/products';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import ProductFormFields from '../form/ProductFormFields';
import { getProductFormValues, ProductFormValues, toProductSaveRequest } from '../form/productFormValues';
import useConfirmDuplicateCodes from '../form/useConfirmDuplicateCodes';
import { buildProductDetailLink } from '../productHelpers';

// articolo.Stato_articolo defaults to 1 in the database, as for products created by the Delphi client.
const DEFAULT_STATUS_ID = 1;

const ProductNewView = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const createMutation = useCreateProduct();
  const confirmDuplicateCodes = useConfirmDuplicateCodes();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { dirtyFields, isSubmitting },
  } = useForm<ProductFormValues>({ defaultValues: { ...getProductFormValues(), status: DEFAULT_STATUS_ID } });

  const onSubmit = async (values: ProductFormValues) => {
    const confirmed = await confirmDuplicateCodes({
      barcode: values.barcode,
      supplierProductCode: values.supplierProductCode,
    });
    if (!confirmed) return;

    try {
      const result = await createMutation.mutateAsync({
        ...toProductSaveRequest(values, values.extendedDescription.trim() !== ''),
        productCode: values.productCode.trim() || undefined,
        isKit: values.isKit,
      });
      const created = result.products.at(0);
      snackbar.success(created ? `Articolo ${created.productCode} creato` : 'Articolo creato');
      navigate(created ? buildProductDetailLink(created.productCode) : RouteConfig.ProductList.buildLink(), {
        replace: true,
      });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile creare l'articolo"));
    }
  };

  return (
    <PageContainer>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={3} sx={{ pb: 10 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">Nuovo articolo</Typography>
          <Typography
            component={RouterLink}
            to={RouteConfig.ProductList.buildLink()}
            color="primary"
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            {'←'} Torna alla lista
          </Typography>
        </Stack>

        <ProductFormFields control={control} dirtyFields={dirtyFields} setValue={setValue} />

        <FormSaveBar
          saving={isSubmitting || createMutation.isPending}
          cancelLabel="Annulla"
          submitLabel="Crea articolo"
          onCancel={() => navigate(RouteConfig.ProductList.buildLink())}
        />
      </Stack>
    </PageContainer>
  );
};

export default ProductNewView;
