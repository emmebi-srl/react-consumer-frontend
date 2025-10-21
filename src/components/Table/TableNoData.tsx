import { Box, SxProps, Typography } from '@mui/material';

interface TableNoDataProps {
  message: string;
  dataTestId?: string;
  sx?: SxProps;
}

function TableNoData({ message, sx }: TableNoDataProps) {
  return (
    <Box textAlign="center" sx={{ py: 4, ...sx }}>
      <Typography>{message || 'Nessun dato disponibile'}</Typography>
    </Box>
  );
}

export default TableNoData;
