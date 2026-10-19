import { Button, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/DriveFileRenameOutline';
import LabelIcon from '@mui/icons-material/LocalOffer';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { fetchProductLabel, useCloneProduct, useDeleteProduct } from '~/proxies/aries-proxy/products';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { buildProductDetailLink } from '../../productHelpers';
import ProductRenameModal from './ProductRenameModal';

interface Props {
  productCode: string;
  // Unsaved form changes are not part of a clone: warn before duplicating.
  hasUnsavedChanges: boolean;
}

const ProductDetailActions: React.FC<Props> = ({ productCode, hasUnsavedChanges }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const cloneMutation = useCloneProduct();
  const deleteMutation = useDeleteProduct();
  const busy = cloneMutation.isPending || deleteMutation.isPending;

  const openLabel = async () => {
    // Open the tab synchronously (popup blockers), then point it to the label once downloaded.
    const labelWindow = window.open('', '_blank');
    try {
      const url = URL.createObjectURL(await fetchProductLabel(productCode));
      if (labelWindow) labelWindow.location.href = url;
      else window.open(url, '_blank');
    } catch (error) {
      labelWindow?.close();
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile generare l'etichetta"));
    }
  };

  const duplicate = async () => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Duplica articolo',
        text: hasUnsavedChanges
          ? "Ci sono modifiche non salvate: verrà duplicato l'articolo così com'è salvato. Continuare?"
          : "Creare una copia dell'articolo con un nuovo codice automatico (codici, note, normative, ricambi, prezzi e immagine compresi)?",
        alertSeverity: 'info',
      },
    });
    if (result.action !== 'YES') return;

    try {
      const created = (await cloneMutation.mutateAsync(productCode)).products.at(0);
      snackbar.success(`Articolo duplicato${created ? `: ${created.productCode}` : ''}`);
      if (created) navigate(buildProductDetailLink(created.productCode));
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile duplicare l'articolo"));
    }
  };

  const remove = async () => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina articolo',
        text: `Eliminare l'articolo ${productCode}? L'operazione non può essere annullata.`,
        alertSeverity: 'error',
      },
    });
    if (result.action !== 'YES') return;

    try {
      await deleteMutation.mutateAsync(productCode);
      snackbar.success('Articolo eliminato');
      navigate(RouteConfig.ProductList.buildLink(), { replace: true });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile eliminare l'articolo"));
    }
  };

  const rename = async () => {
    const result = await modal.showModal({
      component: ProductRenameModal,
      props: { productCode, hasUnsavedChanges },
    });
    if (result.action === 'RENAMED') navigate(buildProductDetailLink(result.newCode), { replace: true });
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <Button size="small" variant="outlined" startIcon={<LabelIcon />} onClick={openLabel}>
        Etichetta
      </Button>
      <Button size="small" variant="outlined" startIcon={<EditIcon />} disabled={busy} onClick={rename}>
        Cambia codice
      </Button>
      <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} disabled={busy} onClick={duplicate}>
        Duplica
      </Button>
      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} disabled={busy} onClick={remove}>
        Elimina
      </Button>
    </Stack>
  );
};

export default ProductDetailActions;
