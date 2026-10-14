import { Chip, TableCell } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DetailDataCell from '~/components/Table/DetailDataCell';
import LabelWithTooltip from '~/components/Table/LabelWithTooltip';
import { MainLabel } from '~/components/Table/TableLabels';
import { Product } from '~/types/aries-proxy/products';

interface Props {
  product: Product;
}

const ProductTableRowContent: React.FC<Props> = ({ product }) => {
  return (
    <>
      <TableCell align="left">
        <MainLabel>{product.productCode}</MainLabel>
      </TableCell>
      <TableCell sx={{ width: '100%', maxWidth: 0 }}>
        <DetailDataCell sx={{ overflow: 'hidden' }}>
          <LabelWithTooltip variant="secondary" label={product.description ?? '—'} />
        </DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{product.supplierProductCode || '—'}</DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{product.productBrand?.name ?? product.brandCode ?? '—'}</DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{product.category?.name ?? '—'}</DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{product.subcategory?.name ?? '—'}</DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{product.productionCostType?.name ?? '—'}</DetailDataCell>
      </TableCell>
      <TableCell align="left">
        <DetailDataCell>{product.measurementUnits ?? '—'}</DetailDataCell>
      </TableCell>
      <TableCell align="center">{product.isKit ? <CheckIcon fontSize="small" color="primary" /> : null}</TableCell>
      <TableCell align="left">
        {product.productStatus ? (
          <Chip
            size="small"
            label={product.productStatus.name}
            color={product.productStatus.isBlocked ? 'error' : 'default'}
            variant={product.productStatus.isBlocked ? 'filled' : 'outlined'}
          />
        ) : (
          <Chip size="small" label="N/D" variant="outlined" />
        )}
      </TableCell>
    </>
  );
};

export default ProductTableRowContent;
