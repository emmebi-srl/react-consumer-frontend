import { ChangeEvent, useRef, useState } from 'react';
import { AttachFile, UploadFile } from '@mui/icons-material';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import useSnackbar from '~/hooks/useSnackbar';
import { getTicketAttachment } from '~/proxies/aries-proxy/api/tickets';
import { useUploadTicketAttachment } from '~/proxies/aries-proxy/tickets';
import { TicketAttachment } from '~/types/aries-proxy/tickets';
import { getApiErrorMessage } from '~/utils/api-error-utils';

interface Props {
  ticketId: number;
  attachments: TicketAttachment[];
  /** Shows "Carica allegato" / "Sostituisci allegato" (edit permission). */
  canUpload?: boolean;
}

const MAX_SIZE = 25 * 1024 * 1024;

/**
 * Attachment of the ticket ("Vedi allegato" / "Modifica allegato" of Delphi): opened in a new tab; an upload replaces
 * the attachment, like the Delphi form that keeps one per ticket.
 */
const TicketAttachmentsList: React.FC<Props> = ({ ticketId, attachments, canUpload = false }) => {
  const snackbar = useSnackbar();
  const [openingId, setOpeningId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadTicketAttachment();

  // The file is behind authentication: download it and open it as a blob URL. The tab is opened at once, inside the
  // click, or the browser would block it as a popup.
  const open = async (attachment: TicketAttachment) => {
    setOpeningId(attachment.id);
    const tab = window.open('', '_blank');
    try {
      const response = await getTicketAttachment(ticketId, attachment.id);
      const type = String(response.headers['content-type'] ?? 'application/octet-stream');
      const url = URL.createObjectURL(new Blob([response.data], { type }));
      if (tab) tab.location.href = url;
      else window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      tab?.close();
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile aprire l'allegato."));
    } finally {
      setOpeningId(null);
    }
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_SIZE) {
      snackbar.error('Il file supera i 25 MB.');
      return;
    }
    try {
      await upload.mutateAsync({ id: ticketId, file });
      snackbar.success('Allegato salvato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile salvare l'allegato."));
    }
  };

  return (
    <Stack spacing={1}>
      {attachments.length ? (
        <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
          {attachments.map((attachment) => (
            <Button
              key={attachment.id}
              size="small"
              variant="outlined"
              startIcon={openingId === attachment.id ? <CircularProgress size={14} /> : <AttachFile />}
              disabled={!attachment.exists || openingId != null}
              title={attachment.exists ? undefined : 'File non trovato sul server'}
              onClick={() => void open(attachment)}
            >
              {attachment.fileName}
            </Button>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Nessun allegato
        </Typography>
      )}
      {canUpload ? (
        <>
          <input ref={inputRef} type="file" hidden onChange={(event) => void onFile(event)} />
          <Button
            size="small"
            startIcon={<UploadFile />}
            onClick={() => inputRef.current?.click()}
            loading={upload.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            {attachments.length ? 'Sostituisci allegato' : 'Carica allegato'}
          </Button>
        </>
      ) : null}
    </Stack>
  );
};

export default TicketAttachmentsList;
