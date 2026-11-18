import { forwardRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { RouteConfig } from '~/routes/routeConfig';
import { Ticket } from '~/types/aries-proxy/tickets';
import { toTicketSelectionId, useActivate, useIsActive } from '../state';

interface TicketTableRowProps extends DataTableRowProps {
  item: Ticket;
}

/**
 * A click opens the summary aside, a double click the editor. Cmd/Ctrl+click and middle-click open the editor
 * in a new tab, like a link (a <tr> can't be an <a>).
 */
const TicketTableRow = forwardRef<HTMLTableRowElement, TicketTableRowProps>(({ item, ...props }, ref) => {
  const navigate = useNavigate();
  const setActive = useActivate();
  const isActive = useIsActive();
  const selectionId = toTicketSelectionId(item);
  const link = RouteConfig.TicketDetail.buildLink({ ticketId: String(item.id) });

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.metaKey || event.ctrlKey) {
      window.open(link, '_blank', 'noopener');
      return;
    }
    setActive(selectionId);
  };

  const handleAuxClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.button === 1) window.open(link, '_blank', 'noopener');
  };

  return (
    <DataTableRow
      {...props}
      ref={ref}
      active={isActive(selectionId)}
      onClick={handleClick}
      onDoubleClick={() => navigate(link)}
      onAuxClick={handleAuxClick}
    />
  );
});

export default TicketTableRow;
