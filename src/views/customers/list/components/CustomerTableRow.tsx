import { forwardRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { RouteConfig } from '~/routes/routeConfig';
import { Customer } from '~/types/aries-proxy/customers';

interface CustomerTableRowProps extends DataTableRowProps {
  entity: Customer;
}

const CustomerTableRow = forwardRef<HTMLTableRowElement, CustomerTableRowProps>(({ entity, ...props }, ref) => {
  const navigate = useNavigate();
  const link = RouteConfig.CustomerDetail.buildLink({ customerId: String(entity.id) });

  // A <tr> can't be an <a>, so mimic link behaviour: modifier-click and middle-click open a new tab.
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

export default CustomerTableRow;
