import { take, call, put, fork, race, CallEffect } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { actionTypes, LoginPayload, AutoLoginPayload } from './actions';
import { authenticate, refreshAuthentication } from '~/proxies/aries-proxy/api/authenticator';

interface LoginAction {
  type: string;
  payload: LoginPayload;
}

interface AutoLoginAction {
  type: string;
  payload: AutoLoginPayload;
}

interface AuthResponse {
  // Define the shape of your authentication response here
  [key: string]: any;
}

const execLogin = async (username: string, password: string): Promise<AuthResponse> =>
  await authenticate({ username, password });

const execAutoLogin = async (refreshToken: string): Promise<AuthResponse> =>
  await refreshAuthentication({ refreshToken });

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 */
export function* doLogin({ username, password }: LoginPayload): SagaIterator {
  yield call(authorize, call(execLogin, username, password));
}

export function* doAutoLogin({ refreshToken }: AutoLoginPayload): SagaIterator {
  yield call(authorize, call(execAutoLogin, refreshToken));
}

export function* authorize(action: CallEffect): SagaIterator {
  // We send an action that tells Redux we're sending a request
  yield put({ type: actionTypes.USER_LOGIN_REQUEST, payload: { sending: true } });

  // We then try to register or log in the user, depending on the request
  try {
    const resp: AuthResponse = yield action;
    yield put({ type: actionTypes.USER_LOGIN_SUCCESS, payload: { response: resp } });

    return true;
  } catch (error) {
    // If we get an error we send Redux the appropiate action and return
    yield put({ type: actionTypes.USER_LOGIN_FAILURE, payload: { error: error } });
    return false;
  } finally {
    // When done, we tell Redux we're not in the middle of a request any more
    yield put({ type: actionTypes.USER_LOGIN_REQUEST, payload: { sending: false } });
  }
}

/**
 * Log in saga
 */
export function* loginFlow(): SagaIterator {
  // Because sagas are generators, doing `while (true)` doesn't block our program
  // Basically here we say "this saga is always listening for actions"
  while (true) {
    // And we're listening for `LOGIN_REQUEST` actions and destructuring its payload
    const request: LoginAction = yield take(actionTypes.USER_LOGIN);
    const { username, password } = request.payload;

    // A `LOGOUT` action may happen while the `authorize` effect is going on, which may
    // lead to a race condition. This is unlikely, but just in case, we call `race` which
    // returns the "winner", i.e. the one that finished first
    yield race({
      auth: call(doLogin, { username, password }),
      //logout: take(LOGOUT)
    });
  }
}

export function* autoLoginFlow(): SagaIterator {
  while (true) {
    const request: AutoLoginAction = yield take(actionTypes.AUTO_LOGIN);
    const { refreshToken } = request.payload;
    yield call(doAutoLogin, { refreshToken });
  }
}

export default [fork(loginFlow), fork(autoLoginFlow)];
