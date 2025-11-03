import React from 'react';
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';
import {
  ChecklistRowDataToggleConfirm,
  ChecklistRowDataToggleNullConfirmQty,
  ChecklistToggleConfirmEnum,
} from '~/types/aries-proxy/checklists';

interface ToggleConfirmRowProps {
  data: ChecklistRowDataToggleConfirm | ChecklistRowDataToggleNullConfirmQty;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
  hasNa?: boolean;
}

const ToggleConfirmRow: React.FC<ToggleConfirmRowProps> = ({ data, onChange, readOnly, hasNa }) => {
  const { value, notes } = data;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 4, md: 2 }}>
        <FormControlLabel
          control={<Checkbox color="success" checked={value === ChecklistToggleConfirmEnum.Yes} readOnly={readOnly} />}
          label="SI"
        />
      </Grid>
      <Grid size={{ xs: 4, md: 2 }}>
        <FormControlLabel
          control={<Checkbox color="error" checked={value === ChecklistToggleConfirmEnum.No} readOnly={readOnly} />}
          label="No"
        />
      </Grid>
      {hasNa ? (
        <Grid size={{ xs: 4, md: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                color="default"
                checked={value === ChecklistToggleConfirmEnum.NotApplicable}
                readOnly={readOnly}
              />
            }
            label="N/A"
          />
        </Grid>
      ) : null}
      {'quantity' in data ? (
        <>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              label="Quantità"
              value={data.quantity}
              type="number"
              onChange={(ev) => onChange({ field: 'quantity', value: ev.target.value, type: 'integer' })}
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              label="Testati"
              value={data.tested}
              type="number"
              onChange={(ev) => onChange({ field: 'tested', value: ev.target.value, type: 'integer' })}
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
        </>
      ) : null}
      <Grid size={{ xs: 12 }}>
        <TextField
          multiline
          minRows={3}
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

export default ToggleConfirmRow;
