import { createRequestTypes } from '../actions'

// ======================================================
// Constants
// ======================================================
export const actionTypes = {
  ...createRequestTypes('USER_LOGIN'),
  AUTO_LOGIN: 'AUTO_LOGIN',
  USER_LOGIN: 'USER_LOGIN', 
  USER_LOGOUT: 'USER_LOGOUT',
  RESET_LOGIN_ERROR: 'RESET_LOGIN_ERROR',
}


// ======================================================
// ACTIONS
// ======================================================
export const resetLoginError = _ =>  ({type: 'RESET_LOGIN_ERROR', payload : {}})
export const autoLogin = ({refreshToken}) => ({type: 'AUTO_LOGIN', payload : {refreshToken}})
export const execLogin = ({username, password}) => ({type: 'USER_LOGIN', payload : {username, password}})