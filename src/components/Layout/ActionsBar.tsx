import { ArrowBack } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

const ActionsBar: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
        Indietro
      </Button>
      <Stack direction="row" alignItems="center" spacing={1}>
        {children}
      </Stack>
    </Stack>
  );
};

export default ActionsBar;
