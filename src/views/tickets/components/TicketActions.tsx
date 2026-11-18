import { useState, MouseEvent } from 'react';
import {
  CalendarMonth,
  ContentCopy,
  Delete,
  Edit,
  ExpandMore,
  LocalOffer,
  MoreHoriz,
  NoteAdd,
  Print,
  PublishedWithChanges,
  TaskAlt,
} from '@mui/icons-material';
import { Button, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import PdfPreviewModal from '~/components/Modals/PdfPreviewModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getTicketSummaryPdf } from '~/proxies/aries-proxy/api/tickets';
import {
  useCloneTicketQuote,
  useDeleteTicket,
  useGenerateTicketQuote,
  useSetTicketPrinted,
} from '~/proxies/aries-proxy/tickets';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { Ticket, TicketPrintScope } from '~/types/aries-proxy/tickets';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import TicketEventModal from './TicketEventModal';
import TicketQuoteCloneModal from './TicketQuoteCloneModal';
import TicketStatusModal from './TicketStatusModal';
import TicketTagsModal from './TicketTagsModal';

interface Props {
  ticket: Ticket;
  /** The aside links the editor; the editor itself doesn't. */
  showEditLink?: boolean;
  onDeleted: () => void;
}

const PRINTS: { scope: TicketPrintScope; label: string; needsSystem?: boolean }[] = [
  { scope: 'system', label: 'Riepilogo impianto', needsSystem: true },
  { scope: 'customer', label: 'Riepilogo cliente (impianti con ticket aperti)' },
  { scope: 'customer_systems', label: 'Riepilogo cliente (tutti gli impianti)' },
];

/**
 * Actions of the Delphi ticket list menu: edit, change status, prints, mark as printed, tags, "fissa a calendario",
 * quote generation / copy, delete.
 */
const TicketActions: React.FC<Props> = ({ ticket, showEditLink = false, onDeleted }) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const { permission } = useModulePermission(AriesModule.Tickets);
  const { permission: quotePermission } = useModulePermission(AriesModule.Quotes);
  const deleteMutation = useDeleteTicket();
  const printedMutation = useSetTicketPrinted();
  const generateQuote = useGenerateTicketQuote();
  const cloneQuote = useCloneTicketQuote();
  const [printAnchor, setPrintAnchor] = useState<HTMLElement | null>(null);
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const [printing, setPrinting] = useState(false);

  const hasCalendarEvent = (ticket.events ?? []).some((event) => event.kind === 'ticket');
  const canEdit = !!permission?.canEdit;
  const canQuote = canEdit && !!quotePermission?.canInsert;

  const openMenu = (setter: (element: HTMLElement | null) => void) => (event: MouseEvent<HTMLElement>) =>
    setter(event.currentTarget);
  const closeMenus = () => {
    setPrintAnchor(null);
    setMoreAnchor(null);
  };

  const print = async (scope: TicketPrintScope, label: string) => {
    closeMenus();
    setPrinting(true);
    try {
      const pdf = new Blob([(await getTicketSummaryPdf(ticket.id, scope)).data], { type: 'application/pdf' });
      void modal.showModal({
        component: PdfPreviewModal,
        props: { pdf, title: `${label} - ${ticket.customerName ?? ''}` },
      });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare la stampa.'));
    } finally {
      setPrinting(false);
    }
  };

  const togglePrinted = async () => {
    closeMenus();
    try {
      await printedMutation.mutateAsync({ id: ticket.id, printed: !ticket.printed });
      snackbar.success(ticket.printed ? 'Ticket segnato come non stampato' : 'Ticket segnato come stampato');
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile aggiornare il ticket.'));
    }
  };

  const openQuote = (quoteId: number, quoteYear: number) =>
    navigate(RouteConfig.QuoteDetail.buildLink({ year: String(quoteYear), quoteId: String(quoteId) }));

  const generate = async () => {
    closeMenus();
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Genera preventivo',
        text: 'Viene creato un nuovo preventivo dal ticket (cliente, impianto, descrizione e prezzi dell’abbonamento) e il ticket viene chiuso. Continuare?',
      },
    });
    if (answer.action !== 'YES') return;
    try {
      const link = await generateQuote.mutateAsync(ticket.id);
      snackbar.success(`Preventivo ${link.quoteId}/${link.quoteYear} creato`);
      openQuote(link.quoteId, link.quoteYear);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile creare il preventivo.'));
    }
  };

  const clone = async () => {
    closeMenus();
    const answer = await modal.showModal({ component: TicketQuoteCloneModal, props: {} });
    if (answer.action !== 'SELECT') return;
    const { quoteId, quoteYear } = answer as unknown as { quoteId: number; quoteYear: number };
    try {
      const link = await cloneQuote.mutateAsync({ id: ticket.id, quoteId, quoteYear });
      snackbar.success(`Preventivo duplicato come ${link.quoteId}/${link.quoteYear}`);
      openQuote(link.quoteId, link.quoteYear);
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile duplicare il preventivo.'));
    }
  };

  const remove = async () => {
    closeMenus();
    const hasDocuments = (ticket.documents?.length ?? 0) > 0;
    const answer = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina ticket',
        text: `Eliminare il ticket ${ticket.ticketId}/${ticket.ticketYear}? Vengono eliminati anche allegati, tag, collegamenti ai rapporti ed eventi di promemoria e scadenza.`,
        alertText: hasDocuments ? 'Il ticket è collegato a rapporti o preventivi.' : undefined,
        alertSeverity: 'warning',
      },
    });
    if (answer.action !== 'YES') return;
    try {
      await deleteMutation.mutateAsync(ticket.id);
      snackbar.success('Ticket eliminato');
      onDeleted();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, 'Non è stato possibile eliminare il ticket.'));
    }
  };

  const busy = generateQuote.isPending || cloneQuote.isPending || deleteMutation.isPending || printedMutation.isPending;
  const hasMore = canEdit || !!permission?.canDelete;

  return (
    <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
      {showEditLink ? (
        <Button
          component={RouterLink}
          to={RouteConfig.TicketDetail.buildLink({ ticketId: String(ticket.id) })}
          variant="contained"
          startIcon={<Edit />}
        >
          {canEdit ? 'Modifica' : 'Apri'}
        </Button>
      ) : null}
      {canEdit ? (
        <Button
          variant="outlined"
          startIcon={<PublishedWithChanges />}
          onClick={() => void modal.showModal({ component: TicketStatusModal, props: { ticket } })}
        >
          Cambia stato
        </Button>
      ) : null}
      {permission?.canPrint ? (
        <Button
          variant="outlined"
          startIcon={printing ? <CircularProgress size={16} /> : <Print />}
          endIcon={<ExpandMore />}
          onClick={openMenu(setPrintAnchor)}
          disabled={printing}
        >
          Stampa
        </Button>
      ) : null}
      {hasMore ? (
        <Button
          variant="text"
          startIcon={busy ? <CircularProgress size={16} /> : <MoreHoriz />}
          onClick={openMenu(setMoreAnchor)}
          disabled={busy}
        >
          Altro
        </Button>
      ) : null}

      <Menu anchorEl={printAnchor} open={!!printAnchor} onClose={closeMenus}>
        {PRINTS.map((item) => (
          <MenuItem
            key={item.scope}
            disabled={item.needsSystem && !ticket.systemId}
            onClick={() => void print(item.scope, item.label)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={moreAnchor} open={!!moreAnchor} onClose={closeMenus}>
        {canEdit ? (
          <MenuItem onClick={() => void togglePrinted()}>
            <ListItemIcon>
              <TaskAlt fontSize="small" />
            </ListItemIcon>
            <ListItemText>{ticket.printed ? 'Segna come non stampato' : 'Segna come stampato'}</ListItemText>
          </MenuItem>
        ) : null}
        {canEdit ? (
          <MenuItem
            onClick={() => {
              closeMenus();
              void modal.showModal({ component: TicketTagsModal, props: { ticket } });
            }}
          >
            <ListItemIcon>
              <LocalOffer fontSize="small" />
            </ListItemIcon>
            <ListItemText>Gestisci tag</ListItemText>
          </MenuItem>
        ) : null}
        {canEdit && !hasCalendarEvent ? (
          <MenuItem
            onClick={() => {
              closeMenus();
              void modal.showModal({ component: TicketEventModal, props: { ticket } });
            }}
          >
            <ListItemIcon>
              <CalendarMonth fontSize="small" />
            </ListItemIcon>
            <ListItemText>Fissa a calendario</ListItemText>
          </MenuItem>
        ) : null}
        {canQuote ? <Divider /> : null}
        {canQuote ? (
          <MenuItem onClick={() => void generate()}>
            <ListItemIcon>
              <NoteAdd fontSize="small" />
            </ListItemIcon>
            <ListItemText>Genera preventivo</ListItemText>
          </MenuItem>
        ) : null}
        {canQuote ? (
          <MenuItem onClick={() => void clone()}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplica preventivo esistente</ListItemText>
          </MenuItem>
        ) : null}
        {permission?.canDelete ? <Divider /> : null}
        {permission?.canDelete ? (
          <MenuItem onClick={() => void remove()} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Elimina</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </Stack>
  );
};

export default TicketActions;
