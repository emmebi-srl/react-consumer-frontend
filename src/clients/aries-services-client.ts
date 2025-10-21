import axios, { isAxiosError } from 'axios';
import _isObject from 'lodash/isObject';
import { apiObjToJsonObj, jsonObjToApiObj } from '../utils/obj-mapper';
import { getLocalStorageItem, KEY_ARIES_API_TOKEN } from '../utils/local-storage';
import { AriesAuthToken } from '~/types/aries-proxy/auth';
import { refreshAuthentication } from '~/proxies/aries-proxy/api/authenticator';
import { isDefined } from '~/types/typeGuards';

let tokenData: AriesAuthToken | null = null;

const ariesServicesClient = axios.create({
  baseURL: import.meta.env.VITE_ARIES_API_HOST,
  headers: { 'Content-Type': 'application/json' },
});

ariesServicesClient.interceptors.request.use(
  function (req) {
    if (tokenData === null) tokenData = getLocalStorageItem(KEY_ARIES_API_TOKEN);
    if (tokenData) {
      req.headers.Authorization = `Bearer ${tokenData.access_token}`;
    }
    if (_isObject(req.data)) {
      req.data = jsonObjToApiObj(req.data, ['nameValuePairs']);
    }
    return req;
  },
  function (error) {
    return Promise.reject(error);
  },
);

ariesServicesClient.interceptors.response.use(
  function (resp) {
    if (resp.headers['content-type'] === 'application/pdf') return resp;
    resp.data = apiObjToJsonObj(resp.data, ['nameValuePairs']);
    return resp;
  },
  function (error) {
    if (!isAxiosError(error) || !error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (error.response.status === 401 && isDefined(originalRequest) && !originalRequest.headers['x-retry']) {
      originalRequest.headers['x-retry'] = true;
      if (tokenData === null) tokenData = getLocalStorageItem<AriesAuthToken>(KEY_ARIES_API_TOKEN);

      const refreshToken = tokenData?.refresh_token;
      if (!refreshToken) return Promise.reject(error);

      return refreshAuthentication({ refreshToken }).then((newTokenData) => {
        tokenData = newTokenData;
        originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
        return ariesServicesClient(originalRequest);
      });
    }

    return Promise.reject(error);
  },
);

export default ariesServicesClient;
