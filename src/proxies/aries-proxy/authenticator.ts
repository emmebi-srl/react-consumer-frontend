import { useMutation } from '@tanstack/react-query';
import { startAuthentication } from '@simplewebauthn/browser';
import { authenticate, authenticateWithPasskey, refreshAuthentication } from './api/authenticator';
import { startPasskeyLogin } from './api/passkey-login';

export const useAuthenticate = () => {
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return authenticate({ username, password });
    },
  });
};

/** Usernameless passkey login: the browser lets the user pick one of the passkeys saved for this site. */
export const useAuthenticateWithPasskey = () => {
  return useMutation({
    mutationFn: async () => {
      const ceremony = await startPasskeyLogin();
      const credential = await startAuthentication({ optionsJSON: JSON.parse(ceremony.optionsJson) });
      return authenticateWithPasskey({ ceremonyId: ceremony.ceremonyId, credentialJson: JSON.stringify(credential) });
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async ({ refreshToken }: { refreshToken: string }) => {
      return refreshAuthentication({ refreshToken });
    },
  });
};
