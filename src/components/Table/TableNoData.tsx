import { Box, SxProps, Typography } from '@mui/material';

interface TableNoDataProps {
  message: string;
  dataTestId?: string;
  sx?: SxProps;
}

function TableNoData({ message, sx }: TableNoDataProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        ...sx,
      }}
    >
      <Typography>{message || 'Nessun dato disponibile'}</Typography>
    </Box>
  );
}

export default TableNoData;
