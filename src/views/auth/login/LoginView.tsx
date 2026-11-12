import React from 'react';
import { Stack } from '@mui/system';
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Divider, Icon, TextField } from '@mui/material';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageContainer from '~/components/Layout/PageContainer';
import { useAuthenticate, useAuthenticateWithPasskey } from '~/proxies/aries-proxy/authenticator';
import { Fingerprint, PersonRounded } from '@mui/icons-material';
import { UsersQueryKeys } from '~/proxies/aries-proxy/users';
import queryClient from '~/clients/query-client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPostLoginRedirectPath } from '~/routes/loginRedirect';
import { isPasskeyCancelled, isPasskeyEnabled } from '~/utils/passkey-utils';

const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Nome utente obbligatorio' }),
  password: z.string().min(1, { message: 'Password obbligatoria' }),
});

type LoginFormModel = z.infer<typeof LoginSchema>;

const LoginView: React.FC = () => {
  const { isPending, mutate: login, error: loginError, reset: resetLogin } = useAuthenticate();
  const passkeyLogin = useAuthenticateWithPasskey();
  const showPasskey = isPasskeyEnabled();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = getPostLoginRedirectPath(searchParams);

  const form = useForm<LoginFormModel>({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: zodResolver(LoginSchema),
  });

  const onLoggedIn = async () => {
    await queryClient.invalidateQueries({
      queryKey: UsersQueryKeys.me,
    });
    navigate(redirectPath, { replace: true });
  };

  const execLogin = (username: string, password: string) => {
    passkeyLogin.reset();
    login({ username, password }, { onSuccess: onLoggedIn });
  };

  const execPasskeyLogin = () => {
    resetLogin();
    passkeyLogin.mutate(undefined, { onSuccess: onLoggedIn });
  };

  // Closing the browser dialog is not an error.
  const passkeyFailed = !!passkeyLogin.error && !isPasskeyCancelled(passkeyLogin.error);

  return (
    <PageContainer
      sx={{
        display: 'flex',
        // Column flex: justifyContent is vertical. On phones the card sits at the top, above the keyboard.
        justifyContent: { xs: 'flex-start', sm: 'center' },
        alignItems: 'center',
        height: 'auto',
        minHeight: '100dvh',
      }}
    >
      <form
        style={{ width: '100%', maxWidth: 600 }}
        onSubmit={form.handleSubmit((data) => execLogin(data.username, data.password))}
      >
        <Card elevation={3} sx={{ p: { xs: 0, sm: 2 } }}>
          <CardHeader
            title={
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Icon component={PersonRounded} fontSize="large" /> <span>Accesso</span>
              </Stack>
            }
          />
          <CardContent>
            <Stack direction="column" spacing={2}>
              <TextField
                {...form.register('username')}
                label="Nome utente"
                autoComplete="username"
                variant="outlined"
                error={!!form.formState.errors.username}
                helperText={form.formState.errors.username?.message}
              />

              <TextField
                {...form.register('password')}
                label="Password"
                type="password"
                autoComplete="current-password"
                variant="outlined"
                error={!!form.formState.errors.password}
                helperText={form.formState.errors.password?.message}
              />
              {loginError ? <Alert severity="error">Credenziali non valide</Alert> : null}
              {passkeyFailed ? (
                <Alert severity="error">
                  Accesso con passkey non riuscito. Se la passkey è stata eliminata, accedi con la password e creane una
                  nuova dal tuo profilo.
                </Alert>
              ) : null}
            </Stack>
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button type="submit" variant="contained" loading={isPending} disabled={passkeyLogin.isPending}>
              Accedi
            </Button>
          </CardActions>
          {showPasskey ? (
            <>
              <Divider sx={{ mx: 2 }}>oppure</Divider>
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<Fingerprint />}
                  loading={passkeyLogin.isPending}
                  disabled={isPending}
                  onClick={execPasskeyLogin}
                >
                  Accedi con passkey
                </Button>
              </CardActions>
            </>
          ) : null}
        </Card>
      </form>
    </PageContainer>
  );
};

export default LoginView;
