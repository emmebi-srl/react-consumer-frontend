import { forwardRef, useCallback } from 'react';
import { Campaign } from '~/types/aries-proxy/campaigns';
import { useActivate, useIsActive } from '../state';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';

interface CampaignTableRowProps extends DataTableRowProps {
  entity: Campaign;
}

const CampaignTableRow = forwardRef<HTMLTableRowElement, CampaignTableRowProps>(({ entity, ...props }, ref) => {
  const setActive = useActivate();
  const isActive = useIsActive();

  const handleClick = useCallback(() => {
    setActive(entity.id.toString());
  }, [setActive, entity.id]);

  return <DataTableRow {...props} ref={ref} active={isActive(entity.id.toString())} onClick={handleClick} />;
});

export default CampaignTableRow;
