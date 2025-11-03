import { TableCell } from '@mui/material';
import DetailDataCell from '~/components/Table/DetailDataCell';
import { MainLabel, MonospaceMainLabel, MonospaceSecondaryLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { Checklist } from '~/types/aries-proxy/checklists';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';

const ChecklistsListRowContent: React.FC<{ checklist: Checklist }> = ({ checklist }) => {
  return (
    <>
      <TableCell align="right">
        <MonospaceMainLabel>{checklist.id}</MonospaceMainLabel>
      </TableCell>
      <TableCell>
        <MonospaceSecondaryLabel>
          {getStringDateByUnixtimestamp({
            unixTimestamp: checklist.executionDate,
          })}
        </MonospaceSecondaryLabel>
      </TableCell>
      <TableCell>
        <DetailDataCell
          sx={{
            overflow: 'hidden',
          }}
        >
          <MainLabel>{checklist.customer?.companyName}</MainLabel>
          <SecondaryLabel>
            {[checklist.customer?.taxCode, checklist.customer?.vat].filter(Boolean).join(' / ')}
          </SecondaryLabel>
        </DetailDataCell>
      </TableCell>
      <TableCell>
        <MainLabel>{checklist.system?.description}</MainLabel>
      </TableCell>
      <TableCell>
        <MainLabel>{checklist.system?.typeDescription}</MainLabel>
      </TableCell>
    </>
  );
};
export default ChecklistsListRowContent;
