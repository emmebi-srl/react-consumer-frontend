import { TableBody, TableBodyProps, useTheme } from '@mui/material';
import { forwardRef } from 'react';

const DataTableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>((props, ref) => {
  const theme = useTheme();
  return (
    <TableBody
      {...props}
      sx={{ position: 'relative', borderTop: '1px solid', borderColor: theme.palette.grey[300], ...props.sx }}
      ref={ref}
    />
  );
});

export default DataTableBody;
