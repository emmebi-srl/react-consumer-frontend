import { TableHead, TableHeadProps } from '@mui/material';
import { forwardRef } from 'react';

const DataTableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>((props, ref) => (
  <TableHead
    {...props}
    sx={{
      position: 'sticky',
      zIndex: 1,
      top: 0,
      ...props.sx,
    }}
    ref={ref}
  />
));

export default DataTableHead;
