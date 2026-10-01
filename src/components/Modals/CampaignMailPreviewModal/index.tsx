import { useMemo } from 'react';
import { AttachFile, Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { sanitize } from 'lettersanitizer';
import type { Attachment } from 'postal-mime';
import { ModalProps } from '~/modals/Modal';
import { useEmailById, useEmailEml } from '~/proxies/aries-proxy/emails';

interface CampaignMailPreviewModalProps extends ModalProps {
  mailId: number;
  recipient?: string;
}

interface PreviewContent {
  subject: string;
  sender?: string;
  html: string;
  attachments: Attachment[];
}

// The stored body contains the open-tracking pixel: it is removed so that previewing
// the mail does not mark it as read.
const trackerImageRegex = /<img\b[^>]*\/api\/email\/\d+\/tracker[^>]*>/gi;

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />');

const toBlob = (attachment: Attachment) => {
  const content = attachment.content;
  if (typeof content === 'string') {
    return new Blob([content], { type: attachment.mimeType });
  }
  return new Blob([content as BlobPart], { type: attachment.mimeType });
};

const downloadAttachment = (attachment: Attachment) => {
  const url = URL.createObjectURL(toBlob(attachment));
  const link = document.createElement('a');
  link.href = url;
  link.download = attachment.filename ?? 'allegato';
  link.click();
  URL.revokeObjectURL(url);
};

// Data URLs (not blob URLs) so that the images also load inside the sandboxed iframe.
const toDataUrl = (attachment: Attachment) => {
  const bytes =
    typeof attachment.content === 'string'
      ? new TextEncoder().encode(attachment.content)
      : new Uint8Array(attachment.content);
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return `data:${attachment.mimeType};base64,${btoa(binary)}`;
};

const buildHtml = (rawHtml: string, attachments: Attachment[] = []) => {
  const inlineImages = new Map<string, string>();
  attachments
    .filter((attachment) => attachment.contentId && attachment.mimeType.startsWith('image/'))
    .forEach((attachment) => {
      const cid = (attachment.contentId ?? '').replace(/^<|>$/g, '');
      inlineImages.set(cid, toDataUrl(attachment));
    });

  return sanitize(rawHtml.replace(trackerImageRegex, ''), undefined, {
    rewriteExternalResources: (url) => (url.startsWith('cid:') ? (inlineImages.get(url.slice(4)) ?? '') : url),
  });
};

const CampaignMailPreviewModal = ({ closeModal, mailId, recipient }: CampaignMailPreviewModalProps) => {
  const emlQuery = useEmailEml(mailId);
  const parsedEml = emlQuery.data;
  const emlHasContent = !!(parsedEml?.html || parsedEml?.text);
  // The EML is preferred; the email stored in the database is used when it is missing or unreadable.
  const useFallback = emlQuery.isError || (emlQuery.isSuccess && !emlHasContent);
  const emailQuery = useEmailById(mailId, { enabled: useFallback });
  const email = emailQuery.data?.emails[0];

  const content = useMemo<PreviewContent | null>(() => {
    if (parsedEml && emlHasContent) {
      const html = buildHtml(parsedEml.html ?? escapeHtml(parsedEml.text ?? ''), parsedEml.attachments);
      return {
        subject: parsedEml.subject ?? '',
        sender: parsedEml.from?.address,
        html,
        attachments: parsedEml.attachments.filter((attachment) => !attachment.related),
      };
    }
    if (useFallback && email) {
      const html = buildHtml(email.body);
      return { subject: email.subject, sender: email.senderAddress ?? undefined, html, attachments: [] };
    }
    return null;
  }, [parsedEml, emlHasContent, useFallback, email]);

  const isLoading = emlQuery.isLoading || (useFallback && emailQuery.isLoading);
  const hasError = useFallback && !isLoading && !content;
  const close = () => closeModal({ action: 'CLOSE' });

  return (
    <Dialog fullWidth maxWidth="md" onClose={close} open>
      <DialogTitle sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        Anteprima email
        <IconButton onClick={close} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', height: '75vh', p: 0 }}>
        {isLoading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : null}
        {hasError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Non sono riuscito a caricare l&apos;email inviata.
          </Alert>
        ) : null}
        {content ? (
          <>
            <Box px={2} py={1.5} borderBottom="1px solid" borderColor="divider">
              <Typography variant="subtitle1" fontWeight={600}>
                {content.subject}
              </Typography>
              {recipient ? (
                <Typography variant="body2" color="text.secondary">
                  A: {recipient}
                </Typography>
              ) : null}
              {content.sender ? (
                <Typography variant="body2" color="text.secondary">
                  Da: {content.sender}
                </Typography>
              ) : null}
              {content.attachments.length ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                  {content.attachments.map((attachment, index) => (
                    <Chip
                      key={`${attachment.filename}-${index}`}
                      icon={<AttachFile />}
                      label={attachment.filename ?? 'allegato'}
                      size="small"
                      variant="outlined"
                      onClick={() => downloadAttachment(attachment)}
                    />
                  ))}
                </Stack>
              ) : null}
            </Box>
            <Box
              component="iframe"
              sandbox=""
              srcDoc={content.html}
              title="Anteprima email"
              sx={{ border: 0, flex: 1 }}
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CampaignMailPreviewModal;
