import { forwardRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { RouteConfig } from '~/routes/routeConfig';
import { Ddt } from '~/types/aries-proxy/ddts';

interface DdtTableRowProps extends DataTableRowProps {
  item: Ddt;
}

/** Opens the editor like a link: Cmd/Ctrl+click and middle-click open a new tab (a <tr> can't be an <a>). */
const DdtTableRow = forwardRef<HTMLTableRowElement, DdtTableRowProps>(({ item, ...props }, ref) => {
  const navigate = useNavigate();
  const link = RouteConfig.DdtDetail.buildLink({ year: String(item.year), ddtId: String(item.id) });

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.metaKey || event.ctrlKey) {
      window.open(link, '_blank', 'noopener');
      return;
    }
    navigate(link);
  };

  const handleAuxClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.button === 1) window.open(link, '_blank', 'noopener');
  };

  return <DataTableRow {...props} ref={ref} onClick={handleClick} onAuxClick={handleAuxClick} />;
});

export default DdtTableRow;
