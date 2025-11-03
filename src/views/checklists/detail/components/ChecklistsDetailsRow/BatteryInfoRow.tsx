import React from 'react';
import { ChecklistRowDataBatterySpec } from '~/types/aries-proxy/checklists';
import { Grid, TextField } from '@mui/material';

interface BatteryInfoRowProps {
  data: ChecklistRowDataBatterySpec;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}
const BatteryInfoRow: React.FC<BatteryInfoRowProps> = ({ data, onChange, readOnly }) => {
  const { quantity, ampere, month, year, notes } = data;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        <TextField
          label="Quantità"
          type="number"
          value={quantity}
          fullWidth
          onChange={(ev) => onChange({ field: 'quantity', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
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
          label="Ampere"
          type="number"
          value={ampere}
          fullWidth
          onChange={(ev) => onChange({ field: 'ampere', value: ev.target.value, type: 'float' })}
          slotProps={{
            input: {
              readOnly,
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
          label="Mese"
          type="number"
          value={month}
          fullWidth
          onChange={(ev) => onChange({ field: 'month', value: ev.target.value, type: 'integer' })}
          slotProps={{
            input: {
              readOnly,
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
          label="Anno"
          type="number"
          value={year}
          fullWidth
          onChange={(ev) => onChange({ field: 'year', value: ev.target.value, type: 'integer' })}
          slotProps={{
            input: {
              readOnly,
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
          label="Note"
          type="text"
          value={notes}
          fullWidth
          onChange={(ev) => onChange({ field: 'notes', value: ev.target.value, type: 'string' })}
          slotProps={{
            input: {
              readOnly,
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default BatteryInfoRow;
