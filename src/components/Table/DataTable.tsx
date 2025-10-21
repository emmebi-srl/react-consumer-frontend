import { Table, TableProps } from '@mui/material';
import { forwardRef } from 'react';

const DataTable = forwardRef<HTMLTableElement, TableProps>((props, ref) => (
  <Table ref={ref} {...props} size="small" sx={{ overflowX: 'auto', ...props.sx }} />
));

export default DataTable;
