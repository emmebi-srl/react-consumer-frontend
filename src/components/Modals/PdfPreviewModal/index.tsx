import { useEffect, useState } from 'react';
import { Close, OpenInNew } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from '@mui/material';
import { ModalProps } from '~/modals/Modal';

interface PdfPreviewModalProps extends ModalProps {
  title: string;
  pdf: Blob;
}

const PdfPreviewModal = ({ closeModal, pdf, title }: PdfPreviewModalProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>();
  const close = () => closeModal({ action: 'CLOSE' });

  // Create and revoke the object URL in the same effect so StrictMode's mount/unmount/mount
  // cycle recreates it instead of leaving the iframe pointing to an already revoked URL.
  useEffect(() => {
    const url = URL.createObjectURL(pdf);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdf]);

  return (
    <Dialog fullWidth maxWidth="lg" onClose={close} open>
      <DialogTitle sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        {title}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
          }}
        >
          <Tooltip title="Apri in una nuova scheda">
            <span>
              <IconButton disabled={!pdfUrl} onClick={() => window.open(pdfUrl)} size="small">
                <OpenInNew fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton onClick={close} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', height: '80vh', p: 0 }}>
        {pdfUrl ? <Box component="iframe" src={pdfUrl} sx={{ border: 0, flex: 1 }} title={title} /> : null}
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewModal;
