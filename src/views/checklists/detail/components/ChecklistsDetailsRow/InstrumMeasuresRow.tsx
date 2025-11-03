import { Grid, TextField } from '@mui/material';
import React from 'react';
import { ChecklistRowDataInstrumMeasures } from '~/types/aries-proxy/checklists';

interface InstrumMeasuresRowProps {
  data: ChecklistRowDataInstrumMeasures;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}

const InstrumMeasuresRow: React.FC<InstrumMeasuresRowProps> = ({ data, onChange, readOnly }) => {
  const { startVoltage, nextVoltage, restAbsorption, alarmAbsorption, hourAutonomy, notes } = data;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2,
        }}
      >
        <TextField
          label="Volt Iniziali"
          type="number"
          value={startVoltage ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'startVoltage', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2,
        }}
      >
        <TextField
          label="Volt Dopo 1 Ora"
          type="number"
          value={nextVoltage ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'nextVoltage', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2,
        }}
      >
        <TextField
          label="Assorbimento a Riposo"
          type="number"
          value={restAbsorption ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'restAbsorption', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2,
        }}
      >
        <TextField
          label="Assorbimento in Allarme"
          type="number"
          value={alarmAbsorption ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'alarmAbsorption', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2,
        }}
      >
        <TextField
          label="Ore Autonomia"
          type="number"
          value={hourAutonomy ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'hourAutonomy', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 6,
          sm: 4,
          md: 2,
        }}
      >
        <TextField
          label="Note"
          value={notes}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'notes', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
    </Grid>
  );
};

export default InstrumMeasuresRow;
