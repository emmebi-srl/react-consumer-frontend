import React from 'react';
import { Stack } from '@mui/system';
import { Alert, Button, Card, CardActions, CardContent, CardHeader, Icon, TextField } from '@mui/material';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageContainer from '~/components/Layout/PageContainer';
import { useAuthenticate } from '~/proxies/aries-proxy/authenticator';
import { PersonRounded } from '@mui/icons-material';
import { UsersQueryKeys } from '~/proxies/aries-proxy/users';
import queryClient from '~/clients/query-client';

const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Nome utente obbligatorio' }),
  password: z.string().min(1, { message: 'Password obbligatoria' }),
});

type LoginFormModel = z.infer<typeof LoginSchema>;

const LoginView: React.FC = () => {
  const { isPending, mutate: login, error: loginError } = useAuthenticate();

  const form = useForm<LoginFormModel>({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: zodResolver(LoginSchema),
  });

  const execLogin = (username: string, password: string) => {
    login(
      { username, password },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: UsersQueryKeys.me,
          });
        },
      },
    );
  };

  return (
    <PageContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={form.handleSubmit((data) => execLogin(data.username, data.password))}>
        <Card elevation={3} sx={{ minWidth: 600, p: 2 }}>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <Icon component={PersonRounded} fontSize="large" /> <span>Accesso</span>
              </Stack>
            }
          />
          <CardContent>
            <Stack direction="column" spacing={2}>
              <TextField
                {...form.register('username')}
                label="Nome utente"
                variant="outlined"
                error={!!form.formState.errors.username}
                helperText={form.formState.errors.username?.message}
              />

              <TextField
                {...form.register('password')}
                label="Password"
                type="password"
                variant="outlined"
                error={!!form.formState.errors.password}
                helperText={form.formState.errors.password?.message}
              />
              {loginError ? <Alert severity="error">Credenziali non valide</Alert> : null}
            </Stack>
          </CardContent>

          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button type="submit" variant="contained" loading={isPending}>
              Accedi
            </Button>
          </CardActions>
        </Card>
      </form>
    </PageContainer>
  );
};

export default LoginView;
