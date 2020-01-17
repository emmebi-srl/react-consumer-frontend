import { all, call, fork, take, put } from 'redux-saga/effects'
import ariesProxy from '../../../proxies/aries-proxy'
import {actionTypes} from './ClientsActions'

const fetchClients = async _ => await ariesProxy.clients.get({includes: 'system,customer'})

function* doGetClients() {
  yield put({type: actionTypes.CLIENTS_GET_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(fetchClients)
    yield put({type:  actionTypes.CLIENTS_GET_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.CLIENTS_GET_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.CLIENTS_GET_REQUEST,  payload: { loading: false }})
  }
}
export function * getClients () {
  while (true) {
    yield take(actionTypes.CLIENTS_GET_REQUEST, doGetClients)
    yield doGetClients()
  }
}

export default function* rootSaga() {
  yield all([
    fork(getClients),
  ])
}
