import { useMutation } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { authenticateResourceAccess } from './api/landing-authenticator';

export const useResourceAccessAuthenticate = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async ({ accessCode }: { accessCode: string }) => authenticateResourceAccess({ accessCode }),
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};
