import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import UsersFilters from './UsersFilters';

const UsersBar: React.FC<{ filteredCount: number; totalCount: number }> = ({ filteredCount, totalCount }) => {
  const theme = useTheme();
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
      <UsersFilters />
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

export default UsersBar;
