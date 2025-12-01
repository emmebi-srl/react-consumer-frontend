import { Checkbox, Chip, TableCell } from '@mui/material';
import DetailDataCell from '~/components/Table/DetailDataCell';
import LabelWithTooltip from '~/components/Table/LabelWithTooltip';
import { MainLabel, SecondaryLabel } from '~/components/Table/TableLabels';
import { Campaign } from '~/types/aries-proxy/campaigns';
import { getStringDateTimeByUnixtimestamp } from '~/utils/datetime-utils';

interface Props {
  campaign: Campaign;
}

const getTemplateName = (templatePath: string) => {
  const parts = templatePath.split('\\');
  return parts[parts.length - 1];
};

const CampaignTableRowContent: React.FC<Props> = ({ campaign }) => {
  return (
    <>
      <TableCell align="right">
        <MainLabel>{campaign.id}</MainLabel>
      </TableCell>
      <TableCell sx={{ width: '100%', maxWidth: 0 }}>
        <DetailDataCell
          sx={{
            overflow: 'hidden',
          }}
        >
          <LabelWithTooltip variant="secondary" label={campaign.name} />
          <SecondaryLabel>{campaign.description}</SecondaryLabel>
        </DetailDataCell>
      </TableCell>
      <TableCell>
        <DetailDataCell>{getTemplateName(campaign.mailTemplatePath)} </DetailDataCell>
      </TableCell>
      <TableCell>
        <Chip label={campaign.campaignType?.name || 'N/A'} />
      </TableCell>
      <TableCell padding="checkbox" align="center">
        <Checkbox checked={campaign.active} readOnly />
      </TableCell>
      <TableCell align="right">
        <DetailDataCell>{getStringDateTimeByUnixtimestamp(campaign.activationDate)}</DetailDataCell>
      </TableCell>
      <TableCell align="right">
        <DetailDataCell>{getStringDateTimeByUnixtimestamp(campaign.deactivationDate)}</DetailDataCell>
      </TableCell>
    </>
  );
};

export default CampaignTableRowContent;
