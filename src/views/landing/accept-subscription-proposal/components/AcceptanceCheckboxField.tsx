import { Alert, Box, Checkbox, FormControlLabel } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface Props {
  checked: boolean;
  errorMessage?: string;
  label: string;
  onChange: (checked: boolean) => void;
}

const AcceptanceCheckboxField: React.FC<Props> = ({ checked, errorMessage, label, onChange }) => {
  return (
    <>
      <Box
        sx={(theme) => ({
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          px: 2,
          py: 1.25,
        })}
      >
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} />}
          label={label}
        />
      </Box>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
    </>
  );
};

export default AcceptanceCheckboxField;
