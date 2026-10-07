import { ArrowBack } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

const ActionsBar: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
        Indietro
      </Button>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
};

export default ActionsBar;
