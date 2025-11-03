import React from 'react';
import { TextField, Grid } from '@mui/material';
import { ChecklistRowDataDateNotes } from '~/types/aries-proxy/checklists';

interface DateNoteRowProps {
  data: ChecklistRowDataDateNotes;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}

const DateNoteRow: React.FC<DateNoteRowProps> = ({ data, onChange, readOnly }) => {
  const { notes } = data;

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          md: 3,
        }}
      >
        <TextField
          label="Data"
          type="date"
          value={data.date || ''}
          fullWidth
          onChange={(ev) => onChange({ field: 'date', value: ev.target.value, type: 'string' })}
          slotProps={{ input: { readOnly } }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 9,
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

export default DateNoteRow;
