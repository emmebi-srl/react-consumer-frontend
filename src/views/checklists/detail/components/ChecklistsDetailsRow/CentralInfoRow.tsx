import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import React from 'react';
import { ChecklistMasterSlaveEnum, ChecklistRowDataCentralInfo } from '~/types/aries-proxy/checklists';

interface CentralInfoRowProps {
  data: ChecklistRowDataCentralInfo;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}
const CentralInfoRow: React.FC<CentralInfoRowProps> = ({ data, onChange, readOnly }) => {
  const { brand, model, notes, position, masterSlave: master_slave, slaveId } = data;

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
        <FormControl fullWidth>
          <RadioGroup
            name="master-slave-group"
            value={master_slave}
            row
            onChange={(ev, value) => onChange({ field: 'masterSlave', value, type: 'string' })}
          >
            <FormControlLabel
              value={ChecklistMasterSlaveEnum.Master}
              sx={{ flex: 1 }}
              control={<Radio />}
              label="Master"
            />
            <FormControlLabel
              value={ChecklistMasterSlaveEnum.Slave}
              sx={{ flex: 1 }}
              control={<Radio />}
              label="Slave"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        <TextField
          label="Slave ID"
          value={slaveId ?? ''}
          fullWidth
          type="text"
          onChange={(ev) => onChange({ field: 'slaveId', value: ev.target.value, type: 'string' })}
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

export default CentralInfoRow;
