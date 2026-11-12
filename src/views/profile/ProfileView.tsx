import { Alert, Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import PageContainer from '~/components/Layout/PageContainer';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useMyAccount } from '~/proxies/aries-proxy/users';
import { isPasskeyConfigured } from '~/utils/passkey-utils';
import ProfileEmailCard from './components/ProfileEmailCard';
import ProfilePasskeysCard from './components/ProfilePasskeysCard';
import ProfilePasswordCard from './components/ProfilePasswordCard';

/**
 * The own account, like the non-admin Delphi TFSettingsUsers: email settings and password, plus the passkeys.
 * Username, user type and roles are changed by an administrator ("Gestisci utenti").
 */
const ProfileView: React.FC = () => {
  const { data: account, isLoading, isError } = useMyAccount();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !account) {
    return (
      <PageContainer>
        <Alert severity="error">Non è stato possibile caricare il profilo.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3} sx={{ pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
            {account.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
              {account.username}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
              <Chip size="small" label={account.userType} />
              {account.roles.includes('aries_admin') ? (
                <Chip size="small" color="primary" label="Amministratore" />
              ) : null}
            </Box>
          </Box>
        </Box>

        {isPasskeyConfigured() ? <ProfilePasskeysCard /> : null}
        <ProfileEmailCard account={account} />
        <ProfilePasswordCard />
      </Stack>
    </PageContainer>
  );
};

export default ProfileView;
