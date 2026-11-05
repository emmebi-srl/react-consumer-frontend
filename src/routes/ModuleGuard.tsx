import { ReactNode } from 'react';
import { Alert } from '@mui/material';
import PageContainer from '~/components/Layout/PageContainer';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useModulePermission } from '~/proxies/aries-proxy/users';

/** Shows the page only to the users who can open the module. */
export const ModuleGuard: React.FC<{ moduleId: number; children: ReactNode }> = ({ moduleId, children }) => {
  const { isLoading, permission } = useModulePermission(moduleId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!permission?.isEnabled) {
    return (
      <PageContainer>
        <Alert severity="warning">Non hai i permessi per accedere a questa sezione.</Alert>
      </PageContainer>
    );
  }

  return <>{children}</>;
};
