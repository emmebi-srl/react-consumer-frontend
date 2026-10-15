import { forwardRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTableRow, { DataTableRowProps } from '~/components/Table/DataTableRow';
import { Product } from '~/types/aries-proxy/products';
import { buildProductDetailLink } from '../../productHelpers';

interface ProductTableRowProps extends DataTableRowProps {
  entity: Product;
}

// Same link-like behaviour as CustomerTableRow: click navigates, Cmd/Ctrl+click and middle-click open a new tab.
const ProductTableRow = forwardRef<HTMLTableRowElement, ProductTableRowProps>(({ entity, ...props }, ref) => {
  const navigate = useNavigate();
  const link = buildProductDetailLink(entity.productCode);

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.metaKey || event.ctrlKey) {
      window.open(link, '_blank', 'noopener');
      return;
    }
    navigate(link);
  };

  const handleAuxClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.button === 1) window.open(link, '_blank', 'noopener');
  };

  return <DataTableRow {...props} ref={ref} onClick={handleClick} onAuxClick={handleAuxClick} />;
});

export default ProductTableRow;
