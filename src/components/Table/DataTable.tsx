import { SxProps, Table, TableProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import { forwardRef, useCallback, useRef } from 'react';
import useResponsiveCardCells from './useResponsiveCardCells';

export interface DataTableProps extends TableProps {
  /** On small screens rows are rendered as cards. Set to false to keep the classic table layout. */
  responsive?: boolean;
}

/** Card layout used below the `sm` breakpoint. Only real data rows (`tr[data-index]` from Virtuoso, or any row in plain tables) become cards. */
const cardSx: SxProps<Theme> = (theme) => ({
  display: 'block',
  width: '100%',

  '& > thead, & > tbody': { display: 'block' },

  // Header: filters row (DataTableHeading children) stays, column labels row becomes a strip of sort chips.
  '& > thead > tr': { display: 'block' },
  '& > thead > tr > th': { display: 'block', borderBottom: 'none' },
  '& > thead > tr[data-table-labels]': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    px: 1.5,
    py: 1,
    '&:not(:has(.MuiTableSortLabel-root))': { display: 'none' },
    '& > th': {
      display: 'none',
      p: 0,
      border: 'none',
      background: 'transparent',
    },
    '& > th:has(.MuiTableSortLabel-root)': {
      display: 'block',
      px: 1.25,
      py: 0.25,
      borderRadius: 4,
      bgcolor: 'common.white',
    },
  },

  // Body rows → cards. Spacing uses a border (not margin) so Virtuoso measures row heights correctly.
  '& > tbody': { bgcolor: 'grey.100' },
  '& > tbody > tr:not(:has(> td[colspan]:only-child)), & > tbody > tr[data-index]': {
    display: 'block',
    position: 'relative',
    px: 1.5,
    py: 1,
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    borderBottom: `8px solid ${theme.palette.grey[100]}`,

    '& > td': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      width: 'auto !important',
      minWidth: '0 !important',
      maxWidth: 'none !important',
      px: 0,
      py: 0.5,
      border: 'none',
      textAlign: 'right',
      '& > *': { minWidth: 0 },
      '&::before': {
        content: 'attr(data-label)',
        flexShrink: 0,
        textAlign: 'left',
        fontSize: 12,
        fontWeight: 600,
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
      },
      '&:not([data-label])::before, &[data-label=""]::before': { display: 'none' },
      '&:empty': { display: 'none' },
    },

    // First cell is the card title.
    '& > td:first-of-type': {
      justifyContent: 'flex-start',
      textAlign: 'left',
      fontWeight: 600,
      '&::before': { display: 'none' },
    },
    // Leave room on the title line for the pinned date.
    '&:has(> td[data-card-date]) > td:first-of-type': { pr: 13 },

    // First date of the row pinned top-right.
    '& > td[data-card-date]': {
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(1.5),
      py: 0.5,
      fontSize: 12,
      color: theme.palette.text.secondary,
      '&::before': { display: 'none' },
      '& *': { fontSize: 12, color: 'inherit' },
    },
  },
});

const DataTable = forwardRef<HTMLTableElement, DataTableProps>(({ responsive = true, ...props }, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cards = responsive && isMobile;

  const innerRef = useRef<HTMLTableElement | null>(null);
  const setRef = useCallback(
    (node: HTMLTableElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useResponsiveCardCells(innerRef, cards);

  return (
    <Table
      ref={setRef}
      {...props}
      size="small"
      sx={[{ overflowX: 'auto' }, cards && cardSx, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
  );
});

export default DataTable;
