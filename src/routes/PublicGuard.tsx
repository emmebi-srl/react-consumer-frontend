import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { RouteConfig } from '~/routes/routeConfig';
import { useUserMe } from '~/proxies/aries-proxy/users';

export const PublicGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading, data, status } = useUserMe();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (data && status === 'success') {
    return <Navigate to={RouteConfig.InterventionsNearby.buildLink()} />;
  }

  return <>{children}</>;
};
