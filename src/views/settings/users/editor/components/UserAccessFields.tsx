import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useUserRoles, useUserTypes } from '~/proxies/aries-proxy/user-accounts';
import { UserFormMode, UserFormValues } from '../userFormValues';

interface Props {
  mode: UserFormMode;
  /** The administrator editing their own account can't remove their admin role (the server refuses it too). */
  isCurrentUser: boolean;
}

const ADMIN_ROLE = 'aries_admin';

/** Username, password, user type (Delphi modules) and roles. */
const UserAccessFields: React.FC<Props> = ({ mode, isCurrentUser }) => {
  const { register, control, formState } = useFormContext<UserFormValues>();
  const { errors } = formState;
  const { data: userTypes = [] } = useUserTypes();
  const { data: roles = [] } = useUserRoles();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register('username')}
          label="Nome utente"
          required
          fullWidth
          size="small"
          autoComplete="off"
          error={!!errors.username}
          helperText={errors.username?.message}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register('password')}
          label={mode === 'create' ? 'Password' : 'Nuova password'}
          type="password"
          required={mode === 'create'}
          fullWidth
          size="small"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message ?? (mode === 'edit' ? 'Lascia vuoto per non cambiarla' : undefined)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          control={control}
          name="userTypeId"
          render={({ field }) => (
            <TextField
              select
              label="Tipologia utente"
              required
              fullWidth
              size="small"
              value={field.value || ''}
              onChange={(event) => field.onChange(Number(event.target.value))}
              error={!!errors.userTypeId}
              helperText={errors.userTypeId?.message ?? 'Decide quali moduli può aprire'}
            >
              {userTypes.map((userType) => (
                <MenuItem key={userType.id} value={userType.id}>
                  {userType.name}
                  {userType.description ? ` - ${userType.description.trim()}` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          control={control}
          name="roleIds"
          render={({ field }) => (
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">Ruoli</FormLabel>
              <FormGroup row>
                {roles.map((role) => {
                  const checked = field.value.includes(role.id);
                  const locked = isCurrentUser && role.appName === ADMIN_ROLE && checked;
                  const checkbox = (
                    <FormControlLabel
                      key={role.id}
                      sx={{ minWidth: { sm: 240 } }}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          disabled={locked}
                          onChange={(_, isChecked) =>
                            field.onChange(
                              isChecked ? [...field.value, role.id] : field.value.filter((id) => id !== role.id),
                            )
                          }
                        />
                      }
                      label={role.name}
                    />
                  );
                  return locked ? (
                    <Tooltip key={role.id} title="Non puoi togliere a te stesso il ruolo di amministratore">
                      <span>{checkbox}</span>
                    </Tooltip>
                  ) : (
                    checkbox
                  );
                })}
              </FormGroup>
              <FormHelperText>Aries Administrator apre le impostazioni di amministrazione</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>
    </Grid>
  );
};

export default UserAccessFields;
