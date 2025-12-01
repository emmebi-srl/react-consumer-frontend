import { Box, Typography, useTheme } from '@mui/material';
import { PropsWithChildren } from 'react';
import { isDefined } from '~/types/typeGuards';

interface Props {
  filteredCount?: number;
  totalCount: number;
}

const Metadata: React.FC<PropsWithChildren<Props>> = ({ children, filteredCount, totalCount }) => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      justifyContent={isDefined(children) ? 'space-between' : 'center'}
      mt={1}
      bgcolor={theme.palette.secondary.light}
      py={1}
      px={3}
      gap={16}
    >
      <Typography variant="subtitle2" mt={0.5} fontWeight={500}>
        {filteredCount && filteredCount === totalCount ? (
          <>
            <strong>{filteredCount}</strong> Risultati su <strong>{totalCount}</strong> Totali
          </>
        ) : (
          <>
            <strong>{filteredCount}</strong> Risultati
          </>
        )}
      </Typography>
      {children}
    </Box>
  );
};

export default Metadata;
