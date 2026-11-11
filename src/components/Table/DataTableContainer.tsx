import { TableContainer, TableContainerProps } from '@mui/material';
import { forwardRef } from 'react';

const DataTableContainer = forwardRef<HTMLDivElement, TableContainerProps>((props, ref) => (
  <TableContainer
    {...props}
    sx={{
      flexGrow: 1,
      overflow: 'initial',
      position: 'relative',
      // Card layout fits the viewport: no sideways panning, and vertical swipes stay on the list.
      '& [data-virtuoso-scroller]:has(table[data-cards])': {
        overflowX: 'hidden',
        overscrollBehaviorX: 'none',
        touchAction: 'pan-y',
      },
      ...props.sx,
    }}
    style={{
      marginTop: 0,
    }}
    ref={ref}
  />
));

export default DataTableContainer;
