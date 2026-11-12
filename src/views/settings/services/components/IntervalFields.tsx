import { Grid, MenuItem, TextField } from '@mui/material';
import { Control, Controller, FieldValues, Path, useWatch } from 'react-hook-form';
import { ServiceIntervalType } from '~/types/aries-proxy/service-settings';
import { INTERVAL_TYPE_LABELS, INTERVAL_VALUE_LABELS } from '../serviceSettingsLabels';

interface IntervalFieldsProps<T extends FieldValues> {
  control: Control<T>;
  typeName: Path<T>;
  valueName: Path<T>;
  intervalTypes: ServiceIntervalType[];
  disabled?: boolean;
}

/** "Intervallo" select plus its value, labelled by what the value means for the chosen type. */
const IntervalFields = <T extends FieldValues>({
  control,
  typeName,
  valueName,
  intervalTypes,
  disabled,
}: IntervalFieldsProps<T>) => {
  const intervalType = useWatch({ control, name: typeName }) as ServiceIntervalType;

  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          control={control}
          name={typeName}
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Intervallo"
              fullWidth
              size="small"
              disabled={disabled}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(Number(event.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {intervalTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {INTERVAL_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          control={control}
          name={valueName}
          render={({ field, fieldState }) => (
            <TextField
              label={INTERVAL_VALUE_LABELS[intervalType] ?? 'Valore'}
              type="number"
              fullWidth
              size="small"
              disabled={disabled || intervalType === ServiceIntervalType.ManualOnly}
              value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
              onChange={(event) => field.onChange(event.target.value === '' ? NaN : Number(event.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default IntervalFields;
