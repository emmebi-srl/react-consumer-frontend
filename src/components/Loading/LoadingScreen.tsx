import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { Box } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: (theme) => theme.spacing(2),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
      <CircularProgress
        size={128}
        thickness={3}
        sx={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          top: '50%',
          marginTop: (theme) => theme.spacing(-8),
          color: (theme) => theme.palette.grey[300],
        }}
      />
    </Box>
  );
};

export default LoadingScreen;
