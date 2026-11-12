import { TableCell, Typography } from '@mui/material';
import { ReactNode } from 'react';
import DataTable from '~/components/Table/DataTable';
import DataTableBody from '~/components/Table/DataTableBody';
import DataTableContainer from '~/components/Table/DataTableContainer';
import DataTableHead from '~/components/Table/DataTableHead';
import DataTableHeading, { ColumnConfig } from '~/components/Table/DataTableHeading';
import DataTableRow from '~/components/Table/DataTableRow';

export interface ServiceConfigColumn<T> {
  label: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => ReactNode;
}

interface ServiceConfigTableProps<T extends { id: number }> {
  items: T[];
  columns: ServiceConfigColumn<T>[];
  selectedId: number | null;
  onSelect: (item: T) => void;
  emptyText: string;
}

/** Small list of services: a click selects the row, the editor shows the selected one. */
const ServiceConfigTable = <T extends { id: number }>({
  items,
  columns,
  selectedId,
  onSelect,
  emptyText,
}: ServiceConfigTableProps<T>) => {
  const headLabel: ColumnConfig<string>[] = columns.map((column) => ({ label: column.label, align: column.align }));

  return (
    <DataTableContainer>
      <DataTable size="small">
        <DataTableHead>
          <DataTableHeading
            order="asc"
            orderBy=""
            rowCount={items.length}
            headLabel={headLabel}
            numSelected={0}
            onRequestSort={() => {}}
            onSelectAllClick={() => {}}
            select={false}
            small
          />
        </DataTableHead>
        <DataTableBody>
          {items.map((item, index) => (
            <DataTableRow
              key={item.id}
              data-index={index}
              active={item.id === selectedId}
              selected={item.id === selectedId}
              onClick={() => onSelect(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.label} align={column.align}>
                  {column.render(item)}
                </TableCell>
              ))}
            </DataTableRow>
          ))}
          {items.length === 0 ? (
            <DataTableRow>
              <TableCell colSpan={columns.length}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {emptyText}
                </Typography>
              </TableCell>
            </DataTableRow>
          ) : null}
        </DataTableBody>
      </DataTable>
    </DataTableContainer>
  );
};

export default ServiceConfigTable;
