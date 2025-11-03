import React from 'react';
import ChecklistsDetailsGeneralCustomer from './ChecklistsDetailsGeneralCustomer';
import ChecklistsDetailsGeneralSystem from './ChecklistsDetailsGeneralSystem';
import { Stack, Box } from '@mui/material';
import { Checklist } from '~/types/aries-proxy/checklists';

const ChecklistsDetailsGeneral: React.FC<{
  checklist: Checklist;
}> = ({ checklist }) => {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: (theme) => theme.palette.divider }}>
      <Stack direction="column" sx={{ overflow: 'hidden' }} gap={4}>
        <ChecklistsDetailsGeneralCustomer checklist={checklist} />
        <ChecklistsDetailsGeneralSystem checklist={checklist} />
      </Stack>
    </Box>
  );
};

export default ChecklistsDetailsGeneral;
