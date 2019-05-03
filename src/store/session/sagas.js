import {take, call, put, fork, race} from 'redux-saga/effects'
import ariesProxy from '../../proxies/aries-proxy'
import {actionTypes} from './actions'

const execLogin = async (username, password) => await ariesProxy.authenticate({username, password})
const execAutoLogin = async (refreshToken) => await ariesProxy.refreshAuthentication({refreshToken})

/**
 * Effect to handle authorization
 * @param  {string} username               The username of the user
 * @param  {string} password               The password of the user
 */
export function * doLogin ({username, password}) {
  yield authorize(_ => call(execLogin, username, password))
}

export function * doAutoLogin ({refreshToken}) {
  yield authorize(_ => call(execAutoLogin, refreshToken))
}

export function * authorize (action) {
  // We send an action that tells Redux we're sending a request
  yield put({type: actionTypes.USER_LOGIN_REQUEST, payload: { sending: true }})

  // We then try to register or log in the user, depending on the request
  try {
    const resp = yield action()
    yield put({type:  actionTypes.USER_LOGIN_SUCCESS, payload: { response: resp }})

    return true;
  } catch (error) {
    // If we get an error we send Redux the appropiate action and return
    yield put({type:  actionTypes.USER_LOGIN_FAILURE, payload: { error: error }})
    return false
  } finally {
    // When done, we tell Redux we're not in the middle of a request any more
    yield put({type:  actionTypes.USER_LOGIN_REQUEST,  payload: { sending: false }})
  }
}

/**
 * Log in saga
 */
export function * loginFlow () {
  // Because sagas are generators, doing `while (true)` doesn't block our program
  // Basically here we say "this saga is always listening for actions"
  while (true) {
    // And we're listening for `LOGIN_REQUEST` actions and destructuring its payload
    const request = yield take(actionTypes.USER_LOGIN)
    const {username, password} = request.payload

    // A `LOGOUT` action may happen while the `authorize` effect is going on, which may
    // lead to a race condition. This is unlikely, but just in case, we call `race` which
    // returns the "winner", i.e. the one that finished first
    yield race({
      auth: call(doLogin, {username, password}),
      //logout: take(LOGOUT)
    })
  }
}


export function * autoLoginFlow () {
  while (true) {
    const request = yield take(actionTypes.AUTO_LOGIN)
    const {refreshToken} = request.payload
    yield call(doAutoLogin, {refreshToken})
  }
}

export default [
  fork(loginFlow),
  fork(autoLoginFlow),
]