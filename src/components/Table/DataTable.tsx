import { SxProps, Table, TableProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import { forwardRef, useCallback, useRef } from 'react';
import useResponsiveCardCells from './useResponsiveCardCells';

export interface DataTableProps extends TableProps {
  /** On small screens rows are rendered as cards. Set to false to keep the classic table layout. */
  responsive?: boolean;
}

/** Gap between the card and the row edges (the visible card is a pseudo-element inset by this amount). */
const OUTER_Y = 6;
const OUTER_X = 10;
/** Padding inside the visible card. */
const INNER = 14;
const PIN_TOP = OUTER_Y + INNER - 4;
const PIN_RIGHT = OUTER_X + INNER - 6;

const role = (name: string) => `& > td[data-card-role="${name}"]`;

/**
 * Card layout used below the `sm` breakpoint. Cell roles come from `useResponsiveCardCells`.
 * Vertical spacing between cards lives inside the row (padding + inset pseudo-element), never in margins,
 * because Virtuoso measures rows with offsetHeight and margins would break its scroll math.
 */
const cardSx: SxProps<Theme> = (theme) => ({
  display: 'block',
  width: '100%',
  // `overflow: auto` on a block table makes it a nested scroll container inside Virtuoso's scroller,
  // which traps touch scrolling and breaks the sticky header.
  overflow: 'visible',

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
    '& > th': { display: 'none', p: 0, border: 'none', background: 'transparent' },
    '& > th:has(.MuiTableSortLabel-root)': {
      display: 'block',
      px: 1.25,
      py: 0.25,
      borderRadius: 4,
      bgcolor: 'common.white',
    },
  },

  '& > tbody': { bgcolor: 'grey.100', borderTop: 'none' },

  // Virtuoso keeps the space of the rows that are not rendered with filler rows: `<tr><td style="height:…"/></tr>`,
  // an empty cell without colSpan. They must keep their height, or the list can't scroll past the loaded rows
  // and `endReached` (infinite scroll) never fires.
  '& > tbody > tr:not([data-index]):has(> td:only-child:empty)': {
    display: 'block',
    '& > td': { display: 'block', p: 0, border: 'none' },
  },

  // Only real data rows become cards: Virtuoso rows (`data-index`), or in plain tables any row that is not
  // a single full-width cell (fillers, "no data").
  '& > tbody > tr[data-index], & > tbody > tr:not(:has(> td:only-child:empty)):not(:has(> td[colspan]:only-child))': {
    '--pin-menu': '0px',
    '--pin-date': '0px',
    '--title-date': '0px',
    '--pin-select': '0px',
    '&:has(> td[data-card-role="menu"])': { '--pin-menu': '36px' },
    '&:has(> td[data-card-role="date"])': { '--pin-date': '112px' },
    '&:has(> td[data-card-role="select"])': { '--pin-select': '36px' },
    '&:not(:has(> td[data-card-role="id"]))': { '--title-date': 'var(--pin-date)' },

    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: 2,
    rowGap: 1.25,
    position: 'relative',
    isolation: 'isolate',
    padding: `${OUTER_Y + INNER}px ${OUTER_X + INNER}px`,
    border: 'none',
    backgroundColor: 'transparent !important',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',

    // The visible card.
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: `${OUTER_Y}px ${OUTER_X}px`,
      zIndex: -1,
      borderRadius: '12px',
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${theme.palette.grey[200]}`,
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 2px 6px rgba(16, 24, 40, 0.06)',
      transition: 'background-color 120ms, box-shadow 120ms',
    },
    '&:active::after': {
      backgroundColor: theme.palette.grey[50],
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.08)',
    },
    '&[data-active]::after': {
      backgroundColor: theme.palette.primary.light,
      borderColor: theme.palette.primary.main,
      boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
    },

    // Fields: label on top, value below, two per row.
    '& > td': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: '2px',
      width: 'auto !important',
      minWidth: '0 !important',
      maxWidth: 'none !important',
      height: 'auto',
      p: 0,
      border: 'none',
      textAlign: 'left',
      fontSize: 14,
      lineHeight: 1.35,
      color: theme.palette.text.primary,
      '& > *': { minWidth: 0, maxWidth: '100%', height: 'auto' },
      '&::before': {
        content: 'attr(data-label)',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
      },
      '&:not([data-label])::before': { display: 'none' },
      '&:empty': { display: 'none' },
    },
    '& > td[data-card-wide]': { gridColumn: '1 / -1' },

    // Eyebrow: "#123" above the title.
    [role('id')]: {
      gridColumn: '1 / -1',
      pl: 'var(--pin-select)',
      pr: 'calc(var(--pin-menu) + var(--pin-date))',
      // "#123" and an optional second line (e.g. the year) side by side.
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: '6px',
      '&::before': { display: 'none' },
      '& *': { fontSize: 12, fontWeight: 600, color: theme.palette.text.secondary },
      '& > *:first-of-type::before': { content: '"#"' },
    },
    [`&:has(> td[data-card-role="id"]) > td[data-card-role="title"]`]: { mt: -1 },

    // Heading.
    [role('title')]: {
      gridColumn: '1 / -1',
      pl: 'var(--pin-select)',
      pr: 'calc(var(--pin-menu) + var(--title-date))',
      '&::before': { display: 'none' },
      '& *': {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.3,
        color: theme.palette.text.primary,
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
      },
    },

    // Pinned to the top corners.
    [role('date')]: {
      position: 'absolute',
      top: `${PIN_TOP + 4}px`,
      right: `calc(${PIN_RIGHT + 6}px + var(--pin-menu))`,
      '&::before': { display: 'none' },
      '& *': { fontSize: 12, color: theme.palette.text.secondary },
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
    [role('menu')]: {
      position: 'absolute',
      top: `${PIN_TOP}px`,
      right: `${PIN_RIGHT}px`,
      '&::before': { display: 'none' },
    },
    [role('select')]: {
      position: 'absolute',
      top: `${PIN_TOP}px`,
      left: `${PIN_RIGHT}px`,
      '&::before': { display: 'none' },
    },

    // Footer with text buttons.
    [role('actions')]: {
      gridColumn: '1 / -1',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      mt: 0.5,
      pt: 1.25,
      borderTop: `1px solid ${theme.palette.grey[200]}`,
      '&::before': { display: 'none' },
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
      data-cards={cards ? '' : undefined}
      {...props}
      size="small"
      sx={[{ overflowX: 'auto' }, cards && cardSx, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
  );
});

export default DataTable;
