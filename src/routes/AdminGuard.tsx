import { ReactNode } from 'react';
import { Alert } from '@mui/material';
import PageContainer from '~/components/Layout/PageContainer';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useIsAriesAdmin } from '~/proxies/aries-proxy/users';

/** Shows the page only to the `aries_admin` users (Delphi admin settings). */
export const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading, isAdmin } = useIsAriesAdmin();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return (
      <PageContainer>
        <Alert severity="warning">Questa sezione è riservata agli amministratori.</Alert>
      </PageContainer>
    );
  }

  return <>{children}</>;
};
