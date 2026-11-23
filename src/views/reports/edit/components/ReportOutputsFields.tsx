import { Checkbox, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup } from '@mui/material';
import { REPORT_OUTPUT_OPTIONS, ReportOutputsState, toggleReportOutput } from '../reportOutputs';

interface ReportOutputsFieldsProps {
  value: ReportOutputsState;
  onChange: (value: ReportOutputsState) => void;
  phoneAvailability: boolean;
  onPhoneAvailabilityChange: (value: boolean) => void;
}

/** "Uscite" of the Delphi report editor: warranty, output checkboxes and phone availability. */
const ReportOutputsFields = ({
  value,
  onChange,
  phoneAvailability,
  onPhoneAvailabilityChange,
}: ReportOutputsFieldsProps) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControl>
        <FormLabel id="report-warranty-label">Garanzia</FormLabel>
        <RadioGroup
          aria-labelledby="report-warranty-label"
          value={value.underWarranty ? 'yes' : 'no'}
          onChange={(event) => onChange({ ...value, underWarranty: event.target.value === 'yes' })}
        >
          <FormControlLabel value="yes" control={<Radio />} label="In garanzia" />
          <FormControlLabel value="no" control={<Radio />} label="Fuori garanzia" />
        </RadioGroup>
      </FormControl>
    </Grid>
    <Grid size={{ xs: 12, sm: 8 }}>
      <Grid container spacing={0}>
        {REPORT_OUTPUT_OPTIONS.map((option) => (
          <Grid key={option.id} size={{ xs: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.outputTypeIds.includes(option.id)}
                  onChange={(event) => onChange(toggleReportOutput(value, option.id, event.target.checked))}
                />
              }
              label={option.label}
            />
          </Grid>
        ))}
        <Grid size={{ xs: 6, md: 4 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={phoneAvailability}
                onChange={(event) => onPhoneAvailabilityChange(event.target.checked)}
              />
            }
            label="Da reperibilità telefonica"
          />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

export default ReportOutputsFields;
