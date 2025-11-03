import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import React from 'react';
import { ChecklistMasterSlaveEnum, ChecklistRowDataMasterSlave } from '~/types/aries-proxy/checklists';

interface MasterSlaveRowProps {
  data: ChecklistRowDataMasterSlave;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}
const MasterSlaveRow: React.FC<MasterSlaveRowProps> = ({ data, onChange, readOnly }) => {
  const { notes, masterSlave, slaveId } = data;

  return (
    <Grid container spacing={2}>
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
            value={masterSlave}
            row
            onChange={(ev, value) => onChange({ field: 'masterSlave', value, type: 'string' })}
          >
            <FormControlLabel
              value={ChecklistMasterSlaveEnum.Master}
              control={<Radio />}
              sx={{ flex: 1 }}
              label="Master"
            />
            <FormControlLabel
              value={ChecklistMasterSlaveEnum.Slave}
              control={<Radio />}
              sx={{ flex: 1 }}
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

export default MasterSlaveRow;
