import { Skeleton, Table, TableBody, TableCell, TableRow } from '@mui/material';

interface TableLoadingProps {
  row: number;
  col: number;
}

export default function TableLoading({ row, col }: TableLoadingProps) {
  return (
    <>
      <Skeleton variant="rectangular" height={20} />
      <Table>
        <TableBody>
          {Array.from({ length: row }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: col }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="rectangular" height={20} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
