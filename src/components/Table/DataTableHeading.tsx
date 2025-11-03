import { Box, Checkbox, SxProps, TableCell, TableRow, TableSortLabel, Typography, useTheme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { ReactNode } from 'react';

export interface ColumnConfig<TSorting extends string> {
  id?: string;
  sortKey?: TSorting;
  label?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableHeadingProps<TSorting extends string> {
  order: 'asc' | 'desc';
  orderBy: TSorting;
  rowCount: number;
  headLabel: ColumnConfig<TSorting>[];
  numSelected: number;
  onRequestSort: (sort: TSorting) => void;
  onSelectAllClick: (checked: boolean) => void;
  select: boolean;
  small?: boolean;
  children?: ReactNode;
}

const smallSx: SxProps = {
  px: 1,
};

const DataTableHeading = <Id extends string>({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
  select,
  small,
  children,
}: DataTableHeadingProps<Id>) => {
  const theme = useTheme();
  const sortDirection = order === 'asc' ? 'asc' : 'desc';

  return (
    <>
      {children && (
        <tr style={{ background: 'white' }}>
          <th colSpan={headLabel.length + 1}>{children}</th>
        </tr>
      )}
      <TableRow sx={{ background: theme.palette.grey[300] }}>
        {select ? (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={Boolean(rowCount > 0 && numSelected === rowCount)}
              onChange={(e, checked) => onSelectAllClick(checked)}
              inputProps={{
                'aria-label': 'Select all',
              }}
            />
          </TableCell>
        ) : null}
        {headLabel.map((headCell, index) => {
          const sortedByThisColumn = orderBy === headCell.sortKey;

          return (
            <TableCell
              key={index}
              align={headCell.align || 'left'}
              sortDirection={sortedByThisColumn ? sortDirection : undefined}
              sx={small ? smallSx : undefined}
            >
              {headCell.sortKey ? (
                <TableSortLabel
                  hideSortIcon
                  active={sortedByThisColumn}
                  direction={sortedByThisColumn ? sortDirection : undefined}
                  onClick={() => {
                    if (headCell.sortKey) {
                      onRequestSort(headCell.sortKey);
                    }
                  }}
                >
                  <Typography variant="body1" noWrap={true} sx={{ fontWeight: 600 }}>
                    {headCell.label}
                  </Typography>
                  {sortedByThisColumn ? (
                    <Box sx={visuallyHidden}>{sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                <Typography variant="body1" noWrap={true} sx={{ fontWeight: 600 }}>
                  {headCell.label}
                </Typography>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
};

export default DataTableHeading;
