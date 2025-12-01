import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import CampaignFilters from './CampaignFilters';
import { useCampaignsMetadata } from '~/proxies/aries-proxy/campaigns';
import { useFilterState } from '../state';

const CampaignBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();

  const { data } = useCampaignsMetadata({
    search: filters.search,
    active: filters.active,
  });

  const filteredCount = data?.metadata.filteredCount ?? 0;
  const totalCount = data?.metadata.totalCount ?? 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      pt={1.5}
      bgcolor="white"
      borderBottom="1px solid"
      borderColor={theme.palette.grey[300]}
    >
      <CampaignFilters />
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

export default CampaignBar;
