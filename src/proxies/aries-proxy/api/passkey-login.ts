import ariesServicesClient from '~/clients/aries-services-client';
import { PasskeyCeremony } from '~/types/aries-proxy/users';

// Not in ./authenticator: aries-services-client imports that file for the token refresh.

/** Anonymous: the challenge the browser signs for the passkey login. */
export const startPasskeyLogin = () =>
  ariesServicesClient.post<PasskeyCeremony>('auth/passkey/login/options').then((resp) => resp.data);
