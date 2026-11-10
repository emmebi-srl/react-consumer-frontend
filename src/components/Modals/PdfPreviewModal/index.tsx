import { useEffect, useState } from 'react';
import { Close, Email, OpenInNew } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from '@mui/material';
import { ModalProps } from '~/modals/Modal';

interface PdfPreviewModalProps extends Omit<ModalProps, 'closeModal'> {
  title: string;
  pdf: Blob;
  /** Shows an "Invia" button: the modal closes with the SEND action and the caller opens the email. */
  sendLabel?: string;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SEND' }) => void;
}

const PdfPreviewModal = ({ closeModal, pdf, title, sendLabel }: PdfPreviewModalProps) => {
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
          {sendLabel ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Email fontSize="small" />}
              onClick={() => closeModal({ action: 'SEND' })}
              sx={{ mr: 1 }}
            >
              {sendLabel}
            </Button>
          ) : null}
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
