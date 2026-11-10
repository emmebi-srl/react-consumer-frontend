import { forwardRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { RouteConfig } from '~/routes/routeConfig';
import { Ddt } from '~/types/aries-proxy/ddts';
import { toDdtSelectionId, useActivate, useIsActive } from '../state';

interface DdtTableRowProps extends DataTableRowProps {
  item: Ddt;
}

/**
 * A click opens the read-only aside, a double click the editor. Cmd/Ctrl+click and middle-click open the editor
 * in a new tab, like a link (a <tr> can't be an <a>).
 */
const DdtTableRow = forwardRef<HTMLTableRowElement, DdtTableRowProps>(({ item, ...props }, ref) => {
  const navigate = useNavigate();
  const setActive = useActivate();
  const isActive = useIsActive();
  const selectionId = toDdtSelectionId(item);
  const link = RouteConfig.DdtDetail.buildLink({ year: String(item.year), ddtId: String(item.id) });

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

export default DdtTableRow;
