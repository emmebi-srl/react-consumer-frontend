import { createRequestTypes } from '../actions';

// ======================================================
// Action Types
// ======================================================
export interface LoginPayload {
  username: string;
  password: string;
}

export interface AutoLoginPayload {
  refreshToken: string;
}

export interface UserLoginAction {
  type: 'USER_LOGIN';
  payload: LoginPayload;
}

export interface AutoLoginAction {
  type: 'AUTO_LOGIN';
  payload: AutoLoginPayload;
}

export interface UserLogoutAction {
  type: 'USER_LOGOUT';
  payload: {};
}

export interface ResetLoginErrorAction {
  type: 'RESET_LOGIN_ERROR';
  payload: {};
}

// ======================================================
// Constants
// ======================================================
const requestTypes = createRequestTypes('USER_LOGIN');

export const actionTypes = {
  USER_LOGIN_REQUEST: `USER_LOGIN_REQUEST`,
  USER_LOGIN_SUCCESS: `USER_LOGIN_SUCCESS`,
  USER_LOGIN_FAILURE: `USER_LOGIN_FAILURE`,
  AUTO_LOGIN: 'AUTO_LOGIN' as const,
  USER_LOGIN: 'USER_LOGIN' as const,
  USER_LOGOUT: 'USER_LOGOUT' as const,
  RESET_LOGIN_ERROR: 'RESET_LOGIN_ERROR' as const,
};

// ======================================================
// ACTIONS
// ======================================================
export const resetLoginError = (): ResetLoginErrorAction => ({
  type: 'RESET_LOGIN_ERROR', 
  payload: {}
});

export const autoLogin = ({ refreshToken }: AutoLoginPayload): AutoLoginAction => ({
  type: 'AUTO_LOGIN', 
  payload: { refreshToken }
});

export const execLogin = ({ username, password }: LoginPayload): UserLoginAction => ({
  type: 'USER_LOGIN', 
  payload: { username, password }
});
