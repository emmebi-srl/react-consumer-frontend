import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import { Checklist } from '~/types/aries-proxy/checklists';
import ChecklistsFilters from './ChecklistsFilters';

interface Props {
  checklists: Checklist[];
}

const ChecklistsBar: React.FC<Props> = ({ checklists }) => {
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
      <ChecklistsFilters />
      <Metadata totalCount={checklists.length} />
    </Box>
  );
};

export default ChecklistsBar;
