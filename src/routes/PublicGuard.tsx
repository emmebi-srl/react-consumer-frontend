import { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useUserMe } from '~/proxies/aries-proxy/users';
import { getPostLoginRedirectPath } from './loginRedirect';

export const PublicGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoading, data, status } = useUserMe();
  const [searchParams] = useSearchParams();
  const redirectPath = getPostLoginRedirectPath(searchParams);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (data && status === 'success') {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
