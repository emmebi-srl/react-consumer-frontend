import { Alert, CircularProgress, Divider, Stack } from '@mui/material';
import SplitAside from '~/components/Layout/SplitAside';
import { AsideContentView } from '~/components/Layout/SplitAside/AsideContentView';
import { AsideSummaryView } from '~/components/Layout/SplitAside/AsideSummaryView';
import { useTicketById } from '~/proxies/aries-proxy/tickets';
import TicketActions from '../../components/TicketActions';
import TicketDetails from '../../components/TicketDetails';
import { formatTicketTitle } from '../../ticketHelpers';
import { parseTicketSelectionId, useActiveId, useIsSidebarOpen, useResetSelection } from '../state';

const TicketAsideContent: React.FC<{ id: number }> = ({ id }) => {
  const reset = useResetSelection();
  const ticketQuery = useTicketById(id);
  const ticket = ticketQuery.data;

  return (
    <>
      <AsideSummaryView
        title={ticket ? formatTicketTitle(ticket) : 'Ticket'}
        subtitle={ticket ? (ticket.customerName ?? '') : 'Caricamento...'}
      />
      <AsideContentView sx={{ gap: 2.5, overflowY: 'auto' }}>
        {ticketQuery.isLoading ? (
          <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <CircularProgress />
          </Stack>
        ) : null}
        {ticketQuery.isError ? <Alert severity="error">Non sono riuscito a caricare il ticket.</Alert> : null}
        {ticketQuery.isSuccess && !ticket ? <Alert severity="warning">Ticket non trovato.</Alert> : null}
        {ticket ? (
          <>
            <TicketActions ticket={ticket} showEditLink onDeleted={reset} />
            <Divider />
            <TicketDetails ticket={ticket} />
          </>
        ) : null}
      </AsideContentView>
    </>
  );
};

/** Quick summary of the selected ticket, with the actions of the Delphi list. */
const TicketAside = () => {
  const activeId = useActiveId();
  const isSidebarOpen = useIsSidebarOpen();
  const reset = useResetSelection();
  const id = parseTicketSelectionId(activeId);

  return (
    <SplitAside open={isSidebarOpen} onClose={reset} width={560}>
      {id ? <TicketAsideContent key={id} id={id} /> : null}
    </SplitAside>
  );
};

export default TicketAside;
