import { useEffect, useMemo, useRef, useState } from 'react';
import { AttachFile, Close, Send } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useEmailById, useEmailEml, useEmailSenders, useSendEmail } from '~/proxies/aries-proxy/emails';
import { useUserMe } from '~/proxies/aries-proxy/users';
import { EmailSender, EmailStatusId } from '~/types/aries-proxy/emails';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import { decodeRtf } from '~/utils/rtf-utils';

interface EmailComposeModalProps extends Omit<ModalProps, 'closeModal'> {
  /** Forward: the new email starts from this one and also carries its attachments. */
  forwardEmailId?: number;
  closeModal: (props?: { action: 'CLOSE' } | { action: 'SENT' }) => void;
}

interface FormValues {
  senderId: number | '';
  to: string;
  bcc: string;
  subject: string;
  body: string;
  pec: boolean;
  readConfirmation: boolean;
}

const htmlToText = (html: string) => {
  const document = new DOMParser().parseFromString(html.replace(/<br\s*\/?>/gi, '\n'), 'text/html');
  return document.body.textContent.replace(/\n{3,}/g, '\n\n').trim();
};

const withSignature = (text: string, signature?: string | null) => (signature ? `${text}${signature}` : text);

/** Same checks Delphi asks to confirm before sending (TEmail.IsValid). */
const getWarnings = (values: FormValues, attachmentCount: number) => {
  const warnings: string[] = [];
  if (!values.subject.trim()) warnings.push("L'email non ha un oggetto.");
  if (/allegat/i.test(values.body) && attachmentCount === 0)
    warnings.push('Il testo cita un allegato ma non ce ne sono.');
  return warnings;
};

const EmailComposeModal = ({ closeModal, forwardEmailId }: EmailComposeModalProps) => {
  const snackbar = useSnackbar();
  const sendMutation = useSendEmail();
  const sendersQuery = useEmailSenders();
  const senders = useMemo(() => sendersQuery.data?.senders ?? [], [sendersQuery.data]);
  const isForward = !!forwardEmailId;
  const { data: userData } = useUserMe();
  const currentUserId = userData?.users.at(0)?.id;

  const emlQuery = useEmailEml(forwardEmailId);
  const emailQuery = useEmailById(forwardEmailId, { enabled: isForward && emlQuery.isError });
  const forwarded = useMemo(() => {
    if (!isForward) return null;
    const eml = emlQuery.data;
    if (eml) {
      return {
        subject: eml.subject ?? '',
        from: eml.from?.address ?? '',
        to: (eml.to ?? []).map((address) => address.address).join('; '),
        date: eml.date ? new Date(eml.date).toLocaleString('it-IT') : '',
        text: eml.text?.trim() || (eml.html ? htmlToText(eml.html) : ''),
        attachments: eml.attachments.filter((attachment) => !attachment.related).map((a) => a.filename ?? 'allegato'),
      };
    }
    const email = emailQuery.data?.emails[0];
    if (email) {
      const isRtf = email.body.trimStart().startsWith('{\\rtf');
      return {
        subject: email.subject,
        from: email.senderAddress ?? '',
        to: email.cc ?? '',
        date: getStringDateTimeByUnixtimestamp(email.sentAt),
        text: isRtf ? decodeRtf(email.body) : htmlToText(email.body),
        attachments: [] as string[],
      };
    }
    return null;
  }, [isForward, emlQuery.data, emailQuery.data]);

  const [files, setFiles] = useState<File[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const previousSender = useRef<EmailSender | undefined>(undefined);
  const initialized = useRef(false);

  const { control, handleSubmit, reset, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: { senderId: '', to: '', bcc: '', subject: '', body: '', pec: false, readConfirmation: false },
  });
  const senderId = watch('senderId');
  const isPec = watch('pec');

  // Starts with the current user, or the first sender that can send.
  useEffect(() => {
    if (initialized.current || !senders.length || (isForward && !forwarded)) return;
    initialized.current = true;
    const sender =
      senders.find((item) => item.id === currentUserId && item.canSend) ??
      senders.find((item) => item.canSend) ??
      senders.at(0);
    if (!sender) return;
    previousSender.current = sender;
    const quoted = forwarded
      ? `\n\n-------- Messaggio inoltrato --------\nDa: ${forwarded.from}\nData: ${forwarded.date}\nOggetto: ${forwarded.subject}\nA: ${forwarded.to}\n\n${forwarded.text}`
      : '';
    reset({
      senderId: sender.id,
      to: '',
      bcc: '',
      subject: forwarded ? `FW: ${forwarded.subject}` : '',
      body: withSignature('\n\n', sender.signature) + quoted,
      pec: false,
      readConfirmation: sender.readConfirmation,
    });
  }, [senders, forwarded, isForward, reset, currentUserId]);

  // Changing sender swaps the signature and the read confirmation default, like CmbBoxSenderCloseUp.
  useEffect(() => {
    if (senderId === '') return;
    const sender = senders.find((item) => item.id === senderId);
    const previous = previousSender.current;
    if (!sender || !previous || previous.id === sender.id) return;
    const body = getValues('body');
    if (previous.signature && body.includes(previous.signature)) {
      setValue('body', body.replace(previous.signature, sender.signature ?? ''));
    }
    setValue('readConfirmation', sender.readConfirmation);
    previousSender.current = sender;
  }, [senderId, senders, getValues, setValue]);

  const selectedSender = senders.find((item) => item.id === senderId);
  const close = () => closeModal({ action: 'CLOSE' });

  const send = async (values: FormValues, confirmed: boolean) => {
    const pendingWarnings = getWarnings(values, files.length + (forwarded?.attachments.length ?? 0));
    if (!confirmed && pendingWarnings.length) {
      setWarnings(pendingWarnings);
      return;
    }
    setWarnings([]);
    setSendError(null);

    try {
      const result = await sendMutation.mutateAsync({
        request: {
          senderId: values.senderId as number,
          to: values.to,
          bcc: values.bcc,
          subject: values.subject,
          body: values.body,
          pec: values.pec,
          readConfirmation: values.readConfirmation,
          forwardedEmailId: forwardEmailId,
        },
        files,
      });
      const email = result.emails[0];
      if (email?.statusId === EmailStatusId.Failed) {
        // The email is saved as failed: it can be sent again from the list.
        setSendError(email.errorMessage || "Il server di posta ha rifiutato l'invio.");
        return;
      }
      snackbar.success('Email inviata');
      closeModal({ action: 'SENT' });
    } catch (error) {
      setSendError(getApiErrorMessage(error, "Non è stato possibile inviare l'email."));
    }
  };

  const isLoading = sendersQuery.isLoading || (isForward && !forwarded && (emlQuery.isLoading || emailQuery.isLoading));

  return (
    <Dialog open onClose={close} fullWidth maxWidth="md">
      <DialogTitle sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        {isForward ? 'Inoltra email' : 'Nuova email'}
        <IconButton onClick={close} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack
            component="form"
            id="email-compose-form"
            spacing={2}
            onSubmit={handleSubmit((values) => send(values, false))}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="senderId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select required label="Da" disabled={isPec} sx={{ minWidth: 260 }}>
                    {senders.map((sender) => (
                      <MenuItem key={sender.id} value={sender.id} disabled={!sender.canSend}>
                        {sender.username}
                        {sender.email ? ` <${sender.email}>` : ''}
                        {sender.canSend ? '' : ' (SMTP non configurato)'}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Stack direction="row" sx={{ alignItems: 'center' }}>
                {sendersQuery.data?.pecAvailable ? (
                  <Controller
                    name="pec"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                        label="PEC"
                      />
                    )}
                  />
                ) : null}
                <Controller
                  name="readConfirmation"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                      label="Conferma lettura"
                    />
                  )}
                />
              </Stack>
            </Stack>
            {isPec ? (
              <Alert severity="info">La PEC parte dalla casella aziendale, in solo testo e senza tracciamento.</Alert>
            ) : null}
            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="A" helperText="Più indirizzi separati da ;" fullWidth />
              )}
            />
            <Controller
              name="bcc"
              control={control}
              render={({ field }) => <TextField {...field} label="CCN" fullWidth />}
            />
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Oggetto" fullWidth slotProps={{ htmlInput: { maxLength: 100 } }} />
              )}
            />
            <Box>
              <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Button size="small" startIcon={<AttachFile />} onClick={() => fileInput.current?.click()}>
                  Allega
                </Button>
                {files.map((file, index) => (
                  <Chip
                    key={`${file.name}-${index}`}
                    size="small"
                    label={file.name}
                    onDelete={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  />
                ))}
                {(forwarded?.attachments ?? []).map((name, index) => (
                  <Chip
                    key={`fw-${name}-${index}`}
                    size="small"
                    variant="outlined"
                    icon={<AttachFile />}
                    label={name}
                  />
                ))}
              </Stack>
              {forwarded?.attachments.length ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Gli allegati dell&apos;email originale vengono inoltrati.
                </Typography>
              ) : null}
              <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []);
                  setFiles((current) => [...current, ...selected]);
                  event.target.value = '';
                }}
              />
            </Box>
            <Controller
              name="body"
              control={control}
              render={({ field }) => <TextField {...field} label="Testo" fullWidth multiline minRows={12} />}
            />
            {selectedSender && !selectedSender.canSend && !isPec ? (
              <Alert severity="warning">Il mittente scelto non ha un server SMTP configurato.</Alert>
            ) : null}
            {warnings.length ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={handleSubmit((values) => send(values, true))}>
                    Invia comunque
                  </Button>
                }
              >
                {warnings.join(' ')}
              </Alert>
            ) : null}
            {sendError ? <Alert severity="error">{sendError}</Alert> : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Annulla</Button>
        <Button
          type="submit"
          form="email-compose-form"
          variant="contained"
          startIcon={sendMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Send />}
          disabled={isLoading || sendMutation.isPending}
        >
          Invia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailComposeModal;
