import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { useResourceAccessAuthenticate } from '~/proxies/aries-proxy/landing-authenticator';
import { RouteConfig } from '~/routes/routeConfig';
import { AriesAuthToken } from '~/types/aries-proxy/auth';
import { getLocalStorageItem, KEY_ARIES_LANDING_API_TOKEN, setLocalStorageItem } from '~/utils/local-storage';

const LandingAccessToken: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isTokenReady, setIsTokenReady] = useState(false);
  const accessCode = searchParams.get('code');
  const { mutateAsync: exchangeAccessCode, isPending: isExchangingAccessCode } = useResourceAccessAuthenticate();

  useEffect(() => {
    const hasStoredToken = Boolean(getLocalStorageItem<AriesAuthToken>(KEY_ARIES_LANDING_API_TOKEN));

    if (hasStoredToken) {
      setIsTokenReady(true);
      return;
    }

    if (accessCode) {
      setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
      exchangeAccessCode({ accessCode })
        .then(() => {
          setIsTokenReady(true);
        })
        .catch(() => {
          setLocalStorageItem(KEY_ARIES_LANDING_API_TOKEN, null);
          navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
        });
      return;
    }

    navigate(RouteConfig.LandingLinkExpired.buildLink(), { replace: true });
  }, [accessCode, exchangeAccessCode, navigate]);

  if (isExchangingAccessCode || !isTokenReady) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
};

export default LandingAccessToken;
