import { forwardRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { RouteConfig } from '~/routes/routeConfig';
import { UserAccount } from '~/types/aries-proxy/users';

interface UserTableRowProps extends DataTableRowProps {
  entity: UserAccount;
}

const UserTableRow = forwardRef<HTMLTableRowElement, UserTableRowProps>(({ entity, ...props }, ref) => {
  const navigate = useNavigate();
  const link = RouteConfig.UserSettingsDetail.buildLink({ userId: String(entity.id) });

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

export default UserTableRow;
