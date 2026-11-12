import { useEffect, useRef, useState } from 'react';
import { Close, Done, DoneAll, ErrorOutlined, Refresh, Send } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import useSnackbar from '~/hooks/useSnackbar';
import { ModalProps } from '~/modals/Modal';
import { useSendWhatsappReply, useWhatsappConversation } from '~/proxies/aries-proxy/whatsapp';
import { RouteConfig } from '~/routes/routeConfig';
import {
  WhatsappConversationMessage,
  WhatsappMessageDirection,
  WhatsappReplyStatus,
} from '~/types/aries-proxy/whatsapp';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';
import { getWhatsappMessageText } from '../whatsappMessageLabels';

/** Same limit as the server (and WhatsApp) for a text message. */
const MaxTextLength = 4096;

interface WhatsappConversationModalProps extends ModalProps {
  /** Digits only, as the sender phone of the received messages. */
  phone: string;
  title?: string;
}

const ReplyStatusIcon: React.FC<{ message: WhatsappConversationMessage }> = ({ message }) => {
  switch (message.status) {
    case WhatsappReplyStatus.Failed:
      return (
        <Tooltip title={message.error ?? 'Invio non riuscito'}>
          <ErrorOutlined color="error" sx={{ fontSize: 16 }} />
        </Tooltip>
      );
    case WhatsappReplyStatus.Read:
      return (
        <Tooltip title="Letto">
          <DoneAll sx={{ fontSize: 16, color: '#34b7f1' }} />
        </Tooltip>
      );
    case WhatsappReplyStatus.Delivered:
      return (
        <Tooltip title="Consegnato">
          <DoneAll sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Tooltip>
      );
    default:
      return (
        <Tooltip title="Inviato">
          <Done sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Tooltip>
      );
  }
};

const MessageBubble: React.FC<{ message: WhatsappConversationMessage }> = ({ message }) => {
  const isOutbound = message.direction === WhatsappMessageDirection.Outbound;
  const isFailed = message.status === WhatsappReplyStatus.Failed;

  return (
    <Stack sx={{ alignItems: isOutbound ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: '80%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          borderTopLeftRadius: isOutbound ? 8 : 2,
          borderTopRightRadius: isOutbound ? 2 : 8,
          bgcolor: isFailed ? '#fdecea' : isOutbound ? '#d9fdd3' : 'common.white',
          border: '1px solid',
          borderColor: isFailed ? 'error.light' : 'grey.200',
          boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
        }}
      >
        {message.type === 'button' ? (
          <Chip size="small" label="Pulsante" sx={{ height: 18, fontSize: 11, mb: 0.5 }} />
        ) : null}
        <Typography
          variant="body2"
          color={message.text ? 'textPrimary' : 'textSecondary'}
          sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
        >
          {getWhatsappMessageText(message.text, message.type)}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end', mt: 0.5 }}>
          <Typography variant="caption" color="textSecondary">
            {isOutbound && message.userName ? `${message.userName} · ` : ''}
            {getStringDateTimeByUnixtimestamp(message.date)}
          </Typography>
          {isOutbound ? <ReplyStatusIcon message={message} /> : null}
        </Stack>
        {isFailed && message.error ? (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {message.error}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
};

/**
 * WhatsApp conversation with one number. A free text reply is possible only within 24 hours from the last
 * message of the customer (Meta rule): after that the box is replaced by an explanation.
 */
const WhatsappConversationModal = ({ closeModal, phone, title }: WhatsappConversationModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const snackbar = useSnackbar();
  const conversationQuery = useWhatsappConversation(phone);
  const sendMutation = useSendWhatsappReply(phone);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = conversationQuery.data;
  const messages = conversation?.messages ?? [];
  const lastMessageKey = messages.length ? `${messages.at(-1)?.direction}-${messages.at(-1)?.id}` : '';
  const close = () => closeModal({ action: 'CLOSE' });

  // Keep the newest message in view, like a chat.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lastMessageKey]);

  const send = async () => {
    const value = text.trim();
    if (!value || sendMutation.isPending) return;
    try {
      const result = await sendMutation.mutateAsync({ text: value });
      const last = result.messages.filter((m) => m.direction === WhatsappMessageDirection.Outbound).at(-1);
      if (last?.status === WhatsappReplyStatus.Failed) {
        snackbar.error(last.error || 'WhatsApp ha rifiutato il messaggio.');
        return;
      }
      setText('');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile inviare il messaggio.'));
    }
  };

  const heading = conversation?.senderName || title || `+${phone}`;

  return (
    <Dialog open onClose={close} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="h6" noWrap>
            {heading}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            +{phone}
            {conversation?.customerId ? (
              <>
                {' · '}
                <Link
                  component={RouterLink}
                  to={RouteConfig.CustomerDetail.buildLink({ customerId: String(conversation.customerId) })}
                  underline="hover"
                  onClick={close}
                >
                  {conversation.customerName ?? `Cliente ${conversation.customerId}`}
                </Link>
              </>
            ) : null}
          </Typography>
        </Box>
        <Tooltip title="Aggiorna">
          <span>
            <IconButton
              size="small"
              onClick={() => conversationQuery.refetch()}
              disabled={conversationQuery.isFetching}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <IconButton size="small" onClick={close} aria-label="Chiudi">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        ref={scrollRef}
        dividers
        sx={{
          bgcolor: '#efeae2',
          height: { xs: 'auto', sm: '55vh' },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {conversationQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : conversationQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(conversationQuery.error, 'Non sono riuscito a caricare la conversazione.')}
          </Alert>
        ) : messages.length === 0 ? (
          <Typography color="textSecondary" sx={{ textAlign: 'center', py: 6 }}>
            Nessun messaggio con questo numero.
          </Typography>
        ) : (
          messages.map((message) => <MessageBubble key={`${message.direction}-${message.id}`} message={message} />)
        )}
      </DialogContent>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {conversation && !conversation.canReply ? (
          <Alert severity="info">
            {conversation.lastReceivedDate
              ? 'Sono passate più di 24 ore dall’ultimo messaggio del cliente: WhatsApp permette di scrivere solo con un template approvato finché il cliente non riscrive.'
              : 'Il cliente non ha mai scritto: WhatsApp permette di contattarlo solo con un template approvato.'}
          </Alert>
        ) : (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={6}
                size="small"
                placeholder="Scrivi una risposta"
                value={text}
                disabled={!conversation || sendMutation.isPending}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  // Enter sends, Shift+Enter goes to a new line, like WhatsApp Web.
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                slotProps={{ htmlInput: { maxLength: MaxTextLength } }}
              />
              <Button
                variant="contained"
                onClick={() => void send()}
                disabled={!text.trim() || !conversation || sendMutation.isPending}
                sx={{ minWidth: 0, px: 2, height: 40 }}
                aria-label="Invia"
              >
                {sendMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Send fontSize="small" />}
              </Button>
            </Stack>
            {conversation?.replyWindowEnd ? (
              <Typography variant="caption" color="textSecondary">
                Puoi rispondere con testo libero fino al {getStringDateTimeByUnixtimestamp(conversation.replyWindowEnd)}{' '}
                (24 ore dall&apos;ultimo messaggio del cliente).
              </Typography>
            ) : null}
          </Stack>
        )}
      </Box>
    </Dialog>
  );
};

export default WhatsappConversationModal;
