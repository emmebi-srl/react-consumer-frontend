import React from 'react';
import { Grid, Stack, TextField } from '@mui/material';
import { Checklist } from '~/types/aries-proxy/checklists';
import HeaderRow from '../ChecklistsDetailsRow/HeaderRow';
import { useEditMode } from '../../state';

const ChecklistsDetailsGeneralCustomer: React.FC<{
  checklist: Checklist;
}> = ({ checklist }) => {
  const [editMode] = useEditMode();
  return (
    <Stack gap={2} direction="column">
      <HeaderRow header={`Cliente - ${checklist.customerId}`} />
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Ragione Sociale"
            value={checklist.customerName}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Ragione Sociale"
            value={checklist.customerName}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Indirizzo"
            value={checklist.customerAddress}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Città"
            value={checklist.customerCity}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Responsabile"
            value={checklist.responsableName ?? ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Ruolo Responsabile"
            value={checklist.responsableJob ?? ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ChecklistsDetailsGeneralCustomer;
