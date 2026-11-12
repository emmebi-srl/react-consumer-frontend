import { zodResolver } from '@hookform/resolvers/zod';
import { DeleteOutlined } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, CardHeader, Chip, Stack } from '@mui/material';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import DetailPageHeader from '~/components/Layout/DetailPageHeader';
import FormSaveBar from '~/components/Layout/FormSaveBar';
import PageContainer from '~/components/Layout/PageContainer';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import UserEmailSettingsFields from '~/components/Users/UserEmailSettingsFields';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import {
  useCreateUserAccount,
  useDeleteUserAccount,
  useUpdateUserAccount,
  useUserAccount,
} from '~/proxies/aries-proxy/user-accounts';
import { useUserMe } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { getApiErrorMessage } from '~/utils/api-error-utils';
import { isPasskeyConfigured } from '~/utils/passkey-utils';
import UserAccessFields from './components/UserAccessFields';
import UserPasskeysCard from './components/UserPasskeysCard';
import { getUserFormSchema, toUserAccountSaveRequest, toUserFormValues, UserFormValues } from './userFormValues';

const cardTitleProps = { title: { variant: 'subtitle1' as const, sx: { fontWeight: 700 } } };

/** Create/edit a user (Delphi TFSettingsUsers in admin mode). */
const UserEditorView: React.FC = () => {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = userIdParam ? Number(userIdParam) : null;
  const mode = userId ? 'edit' : 'create';

  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const modal = useModal();
  const userQuery = useUserAccount(userId);
  const { data: me } = useUserMe();
  const createMutation = useCreateUserAccount();
  const updateMutation = useUpdateUserAccount();
  const deleteMutation = useDeleteUserAccount();

  const user = userQuery.data;
  const isCurrentUser = !!user && user.id === me?.users.at(0)?.id;
  const listLink = RouteConfig.UserSettingsList.buildLink();

  const schema = useMemo(() => getUserFormSchema(mode), [mode]);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    values: toUserFormValues(user),
    resetOptions: { keepDirtyValues: true },
  });
  const { isDirty, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    const request = toUserAccountSaveRequest(values);
    try {
      if (userId) {
        const saved = await updateMutation.mutateAsync({ userId, model: request });
        form.reset(toUserFormValues(saved));
        snackbar.success('Utente salvato');
      } else {
        const created = await createMutation.mutateAsync(request);
        snackbar.success('Utente creato');
        navigate(RouteConfig.UserSettingsDetail.buildLink({ userId: String(created.id) }), { replace: true });
      }
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile salvare l'utente."));
    }
  });

  const remove = async () => {
    if (!user) return;
    const result = await modal.showModal({
      component: ConfirmationModal,
      props: {
        title: 'Elimina utente',
        text: `Eliminare l'utente "${user.username}"? Non potrà più accedere ad Aries.`,
        alertText: 'Un utente collegato a email o documenti non si può eliminare: in quel caso cambia la sua password.',
        alertSeverity: 'info',
      },
    });
    if (result.action !== 'YES') return;

    try {
      await deleteMutation.mutateAsync(user.id);
      snackbar.success('Utente eliminato');
      navigate(listLink, { replace: true });
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile eliminare l'utente."));
    }
  };

  if (userId && userQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (userId && !user) {
    return (
      <PageContainer>
        <Alert severity="error">Utente non trovato.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate>
          <Stack spacing={3} sx={{ pb: 2 }}>
            <DetailPageHeader
              backTo={listLink}
              title={user ? user.username : 'Nuovo utente'}
              badges={
                user ? (
                  <>
                    <Chip size="small" label={user.userType} />
                    {user.roles.includes('aries_admin') ? (
                      <Chip size="small" color="primary" label="Amministratore" />
                    ) : null}
                  </>
                ) : null
              }
              actions={
                user && !isCurrentUser ? (
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlined />}
                    loading={deleteMutation.isPending}
                    onClick={remove}
                  >
                    Elimina
                  </Button>
                ) : null
              }
            />

            <Card variant="outlined">
              <CardHeader title="Accesso" slotProps={cardTitleProps} />
              <CardContent>
                <UserAccessFields mode={mode} isCurrentUser={isCurrentUser} />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Dati ed email"
                subheader="Descrizione, indirizzo e server usati per inviare le email da Aries"
                slotProps={cardTitleProps}
              />
              <CardContent>
                <UserEmailSettingsFields hasEmailPassword={user?.hasEmailPassword ?? false} />
              </CardContent>
            </Card>

            {user && isPasskeyConfigured() ? <UserPasskeysCard userId={user.id} /> : null}
          </Stack>

          {mode === 'create' || isDirty ? (
            <FormSaveBar
              saving={isSubmitting}
              cancelLabel="Annulla"
              submitLabel={mode === 'create' ? 'Crea utente' : 'Salva'}
              onCancel={() => (mode === 'create' ? navigate(listLink) : form.reset())}
            />
          ) : null}
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default UserEditorView;
