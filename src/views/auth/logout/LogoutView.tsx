import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { useUserLogout } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';

const LogoutView: React.FunctionComponent = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { mutateAsync: logout } = useUserLogout();
  const exceptionLogger = useExceptionLogger();

  useEffect(() => {
    async function run() {
      try {
        localStorage.clear();
        await logout();
        queryClient.clear();
      } finally {
        const redirectUrl = new URL(RouteConfig.Login.buildLink(), window.location.origin);
        redirectUrl.search = location.search;
        window.location.href = redirectUrl.toString();
      }
    }

    run().catch(exceptionLogger.captureException);
  }, [queryClient, location.search, logout, exceptionLogger.captureException]);

  return <LoadingScreen />;
};

export default LogoutView;
