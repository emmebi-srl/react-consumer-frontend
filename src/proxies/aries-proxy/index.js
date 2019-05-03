import axios from 'axios'
import {authenticate, refreshAuthentication} from './authenticator'
import checklists from './checklists'
import users from './users'
import { isObject } from '../../utils/is-object';
import { apiObjToJsonObj, jsonObjToApiObj } from '../../utils/obj-mapper';
import { getLocalStorageItem } from '../../utils/local-storage';

export const ARIES_API_TOKEN = "ARIES_API_TOKEN"

let tokenData = null

const instance = axios.create({
  baseURL: process.env.REACT_APP_ARIES_API_HOST,
  headers: {'Content-Type': 'application/json'}
})

instance.interceptors.request.use(function (req) {
  if (tokenData === null) tokenData = getLocalStorageItem(ARIES_API_TOKEN);
  if (tokenData) {
    req.headers['Authorization'] = `Bearer ${tokenData.access_token}`;
  }
  if(isObject(req.data)) {
    req.data = jsonObjToApiObj(req.data, ['nameValuePairs']);
  }
  return req;
}, function (error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(function (resp) {
  if (resp.headers && resp.headers['content-type'] === 'application/pdf') return resp;
  return apiObjToJsonObj(resp.data, ['nameValuePairs']);
}, function (error) {
  const originalRequest = error.config;
  if(error.response.status === 401 && !originalRequest._retry){
    originalRequest._retry = true;
    if (tokenData === null) tokenData = getLocalStorageItem(ARIES_API_TOKEN);
    const refreshToken = tokenData.refresh_token;
    return refreshAuthentication({refreshToken}).then((newTokenData) => {
      tokenData = newTokenData;
      originalRequest.headers['Authorization'] = `Bearer ${tokenData.access_token}`;
      return instance(originalRequest);
    });
  }

  return Promise.reject(error);
});

export default {
  authenticate: authenticate,
  refreshAuthentication: refreshAuthentication,
  checklists: checklists.init(instance), 
  users: users.init(instance),
}