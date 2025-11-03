import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { RouteConfig } from '~/routes/routeConfig';
import { Checklist } from '~/types/aries-proxy/checklists';

const ChecklistTableRow = forwardRef<HTMLTableRowElement, DataTableRowProps & { item: Checklist }>((props, ref) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(RouteConfig.ChecklistDetail.buildLink({ checklistId: props.item.id.toString() }));
  };

  return <DataTableRow onClick={handleClick} {...props} ref={ref} />;
});

export default ChecklistTableRow;
