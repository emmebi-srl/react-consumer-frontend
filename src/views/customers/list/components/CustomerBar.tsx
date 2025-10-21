import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import { Customer } from '~/types/aries-proxy/customers';
import CustomerFilters from './CustomerFilters';

interface Props {
  customers: Customer[];
}

const CustomerBar: React.FC<Props> = ({ customers }) => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      flexDirection="column"
      pt={1.5}
      bgcolor="white"
      borderBottom="1px solid"
      borderColor={theme.palette.grey[300]}
    >
      <CustomerFilters />
      <Metadata count={customers.length} />
    </Box>
  );
};

export default CustomerBar;
