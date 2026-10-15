import { Chip, Link, TableCell } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { buildProductDetailLink } from '../../productHelpers';
import CheckIcon from '@mui/icons-material/Check';
import DelphiColorChip from '~/components/DataDisplay/DelphiColorChip';
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
        <Link
          component={RouterLink}
          to={buildProductDetailLink(product.productCode)}
          color="inherit"
          underline="hover"
          onClick={(event) => event.stopPropagation()}
          onAuxClick={(event) => event.stopPropagation()}
        >
          <MainLabel>{product.productCode}</MainLabel>
        </Link>
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
          <DelphiColorChip label={product.productStatus.name} delphiColor={product.productStatus.color} />
        ) : (
          <Chip size="small" label="N/D" variant="outlined" />
        )}
      </TableCell>
    </>
  );
};

export default ProductTableRowContent;
