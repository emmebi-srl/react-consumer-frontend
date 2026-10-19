import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { useDeleteProductPicture, useProductPicture, useUploadProductPicture } from '~/proxies/aries-proxy/products';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface Props {
  productCode: string;
}

// Picture shared with the Delphi client (<FOTO ARTICOLI>\<code>.jpg). Uploads are converted to JPEG server side.
const ProductPictureCard: React.FC<Props> = ({ productCode }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const pictureQuery = useProductPicture(productCode);
  const uploadMutation = useUploadProductPicture();
  const deleteMutation = useDeleteProductPicture();
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);

  const picture = pictureQuery.data;
  useEffect(() => {
    if (!picture) {
      setPictureUrl(null);
      return;
    }
    const url = URL.createObjectURL(picture);
    setPictureUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [picture]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ productCode, file });
      snackbar.success('Immagine caricata');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile caricare l'immagine"));
    }
  };

  const handleDelete = async () => {
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: { title: 'Rimuovi immagine', text: "Rimuovere l'immagine dell'articolo?", alertSeverity: 'error' },
    });
    if (result.action !== 'YES') return;
    try {
      await deleteMutation.mutateAsync(productCode);
      snackbar.success('Immagine rimossa');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile rimuovere l'immagine"));
    }
  };

  const busy = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader title="Immagine" slotProps={{ title: { variant: 'subtitle1', sx: { fontWeight: 600 } } }} />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: '100%',
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {pictureQuery.isLoading ? (
              <CircularProgress size={28} />
            ) : pictureUrl ? (
              <Box
                component="img"
                src={pictureUrl}
                alt={productCode}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Immagine non disponibile
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<UploadIcon />}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {pictureUrl ? 'Sostituisci' : 'Carica'}
            </Button>
            {pictureUrl && (
              <Button size="small" color="error" startIcon={<DeleteIcon />} disabled={busy} onClick={handleDelete}>
                Rimuovi
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductPictureCard;
