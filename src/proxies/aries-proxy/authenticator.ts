import { useMutation } from '@tanstack/react-query';
import { authenticate, refreshAuthentication } from './api/authenticator';

export const useAuthenticate = () => {
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return authenticate({ username, password });
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
