import React, { useEffect } from 'react';
import { Box } from '@mui/system';
import { getLocalStorageItem, KEY_ARIES_API_TOKEN, setLocalStorageItem } from './utils/local-storage';
import { getParameterByName } from './utils/query-string';
import { useRefreshToken } from './proxies/aries-proxy/authenticator';
import { AriesAuthToken } from './types/aries-proxy/auth';
import LoadingScreen from './components/Loading/LoadingScreen';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routes';

const App: React.FC = () => {
  const { mutate: doRefreshToken, isPending: isRefreshTokenPending } = useRefreshToken();

  // On mount: try auto-login
  useEffect(() => {
    let refreshToken = getParameterByName('refreshToken');

    if (!refreshToken) {
      const tokenData = getLocalStorageItem<AriesAuthToken>(KEY_ARIES_API_TOKEN);
      if (tokenData) {
        // if you have typings for tokenData, update this cast
        refreshToken = tokenData.refresh_token;
      }
    } else {
      // came from URL param → clear stored token
      setLocalStorageItem(KEY_ARIES_API_TOKEN, null);
    }

    if (refreshToken) {
      doRefreshToken({ refreshToken });
    }
  }, [doRefreshToken]);

  if (isRefreshTokenPending) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ height: '100%' }}>
      <RouterProvider router={router} />
    </Box>
  );
};

export default App;
