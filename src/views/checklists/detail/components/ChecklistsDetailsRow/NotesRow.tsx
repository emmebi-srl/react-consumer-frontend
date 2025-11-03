import React from 'react';
import { TextField } from '@mui/material';
import { ChecklistRowDataNotes } from '~/types/aries-proxy/checklists';

interface NotesRowProps {
  data: ChecklistRowDataNotes;
  onChange: (change: { field: string; value: string | number; type: 'float' | 'integer' | 'string' }) => void;
  readOnly: boolean;
}

const NotesRow: React.FC<NotesRowProps> = ({ data, onChange, readOnly }) => {
  const { notes } = data;

  return (
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
  );
};

export default NotesRow;
