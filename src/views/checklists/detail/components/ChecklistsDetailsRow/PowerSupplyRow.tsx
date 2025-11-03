import { Grid, TextField } from '@mui/material';
import React from 'react';
import { ChecklistRowDataPowerSupplyInfo } from '~/types/aries-proxy/checklists';

interface PowerSupplyRowProps {
  data: ChecklistRowDataPowerSupplyInfo;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}
const PowerSupplyRow: React.FC<PowerSupplyRowProps> = ({ data, onChange, readOnly }) => {
  const { brand, notes, model, position, ampere } = data;

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
          label="Marca"
          type="text"
          value={brand ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'brand', value: ev.target.value, type: 'string' })}
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
          label="Modello"
          type="text"
          value={model ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'model', value: ev.target.value, type: 'string' })}
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
          label="Posizione"
          type="text"
          value={position ?? ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'position', value: ev.target.value, type: 'string' })}
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
          value={ampere ?? ''}
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

export default PowerSupplyRow;
