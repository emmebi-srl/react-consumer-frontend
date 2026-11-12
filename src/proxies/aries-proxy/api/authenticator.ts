import { KEY_ARIES_API_TOKEN, setLocalStorageItem } from '../../../utils/local-storage';
import { AriesAuthToken } from '~/types/aries-proxy/auth';
import ariesAuthClient from '~/clients/aries-auth-client';

const jsonObjToUrlEncoded = <T extends Record<string, unknown>>(obj: T) => {
  return (Object.keys(obj) as (keyof T)[]).reduce<string>((memo, key) => {
    const separator = memo === '' ? '' : '&';
    const value = obj[key];
    return `${memo}${separator}${String(key)}=${String(value ?? '')}`;
  }, '');
};

const saveToken = (tokenData: AriesAuthToken) => {
  setLocalStorageItem(KEY_ARIES_API_TOKEN, tokenData);
};

export const authenticate = ({ username, password }: { username: string; password: string }) => {
  return ariesAuthClient
    .post<AriesAuthToken>(
      'oauth2/Token',
      jsonObjToUrlEncoded({
        username,
        password,
        grant_type: 'password',
      }),
    )
    .then((resp) => resp.data)
    .then((tokenData) => {
      saveToken(tokenData);
      return tokenData;
    });
};

/**
 * Passkey login, after the browser signed the challenge of `startPasskeyLogin` (`./passkey-login`): same tokens as
 * the password login. `credentialJson` is the browser AuthenticationResponseJSON.
 */
export const authenticateWithPasskey = ({
  ceremonyId,
  credentialJson,
}: {
  ceremonyId: string;
  credentialJson: string;
}) => {
  // URLSearchParams encodes the values: the credential is JSON with characters that must be escaped.
  const body = new URLSearchParams({ grant_type: 'passkey', ceremony_id: ceremonyId, credential: credentialJson });
  return ariesAuthClient
    .post<AriesAuthToken>('oauth2/Token', body.toString())
    .then((resp) => resp.data)
    .then((tokenData) => {
      saveToken(tokenData);
      return tokenData;
    });
};

export const refreshAuthentication = ({ refreshToken }: { refreshToken: string }) => {
  return ariesAuthClient
    .post<AriesAuthToken>(
      'oauth2/Token',
      jsonObjToUrlEncoded({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    )
    .then((resp) => resp.data)
    .then((tokenData) => {
      saveToken(tokenData);
      return tokenData;
    });
};
