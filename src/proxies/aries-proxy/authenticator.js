import axios from 'axios'
import {ARIES_API_TOKEN} from './index';
import { setLocalStorageItem } from '../../utils/local-storage';

/**
 * Class responsible to execute authenticate and refreh the user token
 */
const instance = axios.create({
  baseURL: process.env.REACT_APP_ARIES_AUTH_HOST,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Authorization': `Basic ${process.env.REACT_APP_ARIES_BASIC_AUTH_VALUE}`
  }
});

const jsonObjToUrlEncoded = (obj) => {
  return Object.keys(obj).reduce((memo, key) => {
    const separator = (memo === '' ? '' : '&'); 
    return `${memo}${separator}${key}=${obj[key]}`;
  }, '');
};

const saveToken = (tokenData) => {
  setLocalStorageItem(ARIES_API_TOKEN, tokenData);
}

export const authenticate = ({ username, password }) => {
  return instance.post('oauth2/Token', jsonObjToUrlEncoded({
    username, 
    password, 
    grant_type: 'password'
  })).then(resp => resp.data).then(tokenData => {
    saveToken(tokenData);
    return tokenData; 
  });
};

export const refreshAuthentication = ({ refreshToken }) => {
  return instance.post('oauth2/Token', jsonObjToUrlEncoded({
    refresh_token: refreshToken, 
    grant_type: 'refresh_token',
  })).then(resp => resp.data).then(tokenData => {
    saveToken(tokenData);
    return tokenData; 
  });
};