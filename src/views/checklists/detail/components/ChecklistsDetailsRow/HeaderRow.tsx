import React from 'react';
import { Box, Typography } from '@mui/material';

const HeaderRow: React.FC<{ header: string }> = ({ header }) => {
  return (
    <Box sx={{ backgroundColor: (theme) => theme.palette.grey[200], px: 2, py: 1 }}>
      <Typography variant={'h5'}>{header}</Typography>
    </Box>
  );
};

export default HeaderRow;
