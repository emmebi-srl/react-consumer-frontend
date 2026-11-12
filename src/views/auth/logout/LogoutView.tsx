import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { useUserLogout } from '~/proxies/aries-proxy/users';
import { RouteConfig } from '~/routes/routeConfig';
import { KEYS_KEPT_ON_LOGOUT } from '~/utils/local-storage';

const LogoutView: React.FunctionComponent = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { mutateAsync: logout } = useUserLogout();
  const exceptionLogger = useExceptionLogger();

  useEffect(() => {
    async function run() {
      try {
        // While the token is still stored: the server revokes its refresh token (user/logout needs the Bearer).
        await logout();
      } finally {
        const kept = KEYS_KEPT_ON_LOGOUT.map((key) => [key, localStorage.getItem(key)] as const);
        localStorage.clear();
        kept.forEach(([key, value]) => value !== null && localStorage.setItem(key, value));
        queryClient.clear();
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
