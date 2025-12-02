import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import { useQuotesMetadata } from '~/proxies/aries-proxy/quotes';
import QuoteFilters from './QuoteFilters';
import { useFilterState } from '../state';

const QuoteBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();

  const { data } = useQuotesMetadata({
    search: filters.search,
    year: filters.year,
    statusId: filters.statusId,
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
      <QuoteFilters />
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

export default QuoteBar;
