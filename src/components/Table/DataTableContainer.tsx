import { TableContainer, TableContainerProps } from '@mui/material';
import { forwardRef } from 'react';

const DataTableContainer = forwardRef<HTMLDivElement, TableContainerProps>((props, ref) => (
  <TableContainer
    {...props}
    sx={{
      flexGrow: 1,
      overflow: 'initial',
      position: 'relative',
      ...props.sx,
    }}
    style={{
      marginTop: 0,
    }}
    ref={ref}
  />
));

export default DataTableContainer;
