import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import { useCustomersMetadata } from '~/proxies/aries-proxy/customers';
import { useFilterState } from '../state';
import CustomerFilters from './CustomerFilters';

const CustomerBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();

  const { data } = useCustomersMetadata({
    search: filters.search,
    statusId: filters.statusId,
    customerTypeId: filters.customerTypeId,
  });

  const filteredCount = data?.metadata.filteredCount ?? 0;
  const totalCount = data?.metadata.totalCount ?? 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 1.5,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: theme.palette.grey[300],
      }}
    >
      <CustomerFilters />
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

export default CustomerBar;
