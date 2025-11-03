import React from 'react';
import { Checklist } from '~/types/aries-proxy/checklists';
import { Grid, Stack, TextField } from '@mui/material';
import { getStringDateByUnixtimestamp } from '~/utils/datetime-utils';
import HeaderRow from '../ChecklistsDetailsRow/HeaderRow';
import { useEditMode } from '../../state';

const ChecklistsDetailsGeneralSystem: React.FC<{
  checklist: Checklist;
}> = ({ checklist }) => {
  const [editMode] = useEditMode();
  return (
    <Stack gap={2} direction="column">
      <HeaderRow header={`Impianto - ${checklist.systemId}`} />
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <TextField
            label="Descrizione"
            value={checklist.system?.description || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
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
            label="Centrale"
            value={checklist.systemCentral}
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
            label="Installato il"
            value={
              checklist.systemInstalledDate
                ? getStringDateByUnixtimestamp({
                    unixTimestamp: checklist.systemInstalledDate,
                  })
                : ''
            }
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
            label="Installato in"
            value={checklist.systemInstalledPlace || ''}
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
            label="Visita numero"
            value={checklist.visitNumber || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
            type="text"
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
            label="Controllo periodico"
            value={checklist.periodicCheck || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
            type="text"
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
            label="Reparti"
            value={checklist.systemDepartments || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: !editMode,
              },
            }}
            type="text"
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ChecklistsDetailsGeneralSystem;
