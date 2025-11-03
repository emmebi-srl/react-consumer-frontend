import React from 'react';
import { ChecklistRowDataSuctionSystem, ChecklistSuctionSystemTypeEnum } from '~/types/aries-proxy/checklists';
import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';

interface SuctionSystemRowProps {
  data: ChecklistRowDataSuctionSystem;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}

const SuctionSystemRow: React.FC<SuctionSystemRowProps> = ({ data, onChange, readOnly }) => {
  const { suctionSystemType, sensorNumber, brand, model, position, notes } = data;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          md: 8,
        }}
      >
        <FormControl fullWidth>
          <RadioGroup
            name="snmp-version-group"
            value={suctionSystemType ?? ChecklistSuctionSystemTypeEnum.None}
            row
            onChange={(ev, value) => onChange({ field: 'suctionSystemType', value, type: 'integer' })}
          >
            <FormControlLabel
              value={ChecklistSuctionSystemTypeEnum.None}
              control={<Radio />}
              sx={{ flex: 1 }}
              label="Non disponibile"
            />
            <FormControlLabel
              value={ChecklistSuctionSystemTypeEnum.Normal}
              control={<Radio />}
              sx={{ flex: 1 }}
              label="Normale"
            />
            <FormControlLabel
              value={ChecklistSuctionSystemTypeEnum.Laser}
              control={<Radio />}
              sx={{ flex: 1 }}
              label="Laser"
            />
            <FormControlLabel
              value={ChecklistSuctionSystemTypeEnum.HighSensitivity}
              control={<Radio />}
              sx={{ flex: 1 }}
              label="Alta sensibilitá"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <TextField
          label="Numero Sensore"
          value={sensorNumber || ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'sensorNumber', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
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

export default SuctionSystemRow;
