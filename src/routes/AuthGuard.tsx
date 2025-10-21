import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { RouteConfig } from '~/routes/routeConfig';
import _isEmpty from 'lodash/isEmpty';
import { useUserMe } from '~/proxies/aries-proxy/users';

export const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading, data } = useUserMe();
  const location = useLocation();

  const redirectUrlSearchParams = new URLSearchParams();
  if (location.pathname !== RouteConfig.AppRoot.buildLink() || location.search.length !== 0) {
    redirectUrlSearchParams.set('rd', location.pathname + location.search);
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  console.log('AuthGuard data', data);
  if (!data) {
    const path = RouteConfig.Logout.buildLink();
    const queryString = redirectUrlSearchParams.toString();
    const to = !_isEmpty(queryString) ? `${path}?${queryString}` : path;

    return <Navigate to={to} />;
  }

  return <>{children}</>;
};
