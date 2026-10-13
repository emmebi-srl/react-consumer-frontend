import { Button, Paper } from '@mui/material';

interface Props {
  saving: boolean;
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
}

const CustomerFormSaveBar: React.FC<Props> = ({ saving, cancelLabel, submitLabel, onCancel }) => (
  <Paper
    elevation={4}
    sx={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      p: 2,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 2,
      zIndex: 10,
    }}
  >
    <Button variant="outlined" disabled={saving} onClick={onCancel}>
      {cancelLabel}
    </Button>
    <Button type="submit" variant="contained" disabled={saving}>
      {saving ? 'Salvataggio…' : submitLabel}
    </Button>
  </Paper>
);

export default CustomerFormSaveBar;
