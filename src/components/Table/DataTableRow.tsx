import { TableRow, TableRowProps, Theme } from '@mui/material';
import { forwardRef } from 'react';

export interface DataTableRowProps extends TableRowProps {
  active?: boolean;
  hidden?: boolean;
}

const DataTableRow = forwardRef<HTMLTableRowElement, DataTableRowProps>(({ hidden, active, ...props }, ref) => {
  const getBackgroundColor = (theme: Theme) => {
    if (active) return theme.palette.primary.light;
    if (hidden) return theme.palette.grey[100];
    return 'white';
  };
  return (
    <TableRow
      hover
      ref={ref}
      tabIndex={-1}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: (theme) => theme.palette.grey[200],
        backgroundColor: (theme) => getBackgroundColor(theme),
        opacity: hidden ? 0.5 : 1,
      }}
      {...props}
    />
  );
});

export default DataTableRow;
