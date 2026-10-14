import { Box, useTheme } from '@mui/material';
import Metadata from '~/components/Table/Metadata';
import { useProductsMetadata } from '~/proxies/aries-proxy/products';
import { useFilterState } from '../state';
import ProductFilters from './ProductFilters';

const ProductBar: React.FC = () => {
  const theme = useTheme();
  const filters = useFilterState();

  const { data } = useProductsMetadata({
    search: filters.search,
    statusId: filters.statusId,
    brandId: filters.brandId,
    categoryId: filters.categoryId,
    subcategoryId: filters.subcategoryId,
    isKit: filters.isKit,
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
      <ProductFilters />
      <Metadata filteredCount={filteredCount} totalCount={totalCount} />
    </Box>
  );
};

export default ProductBar;
