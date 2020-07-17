import { all, call, fork, take, put } from 'redux-saga/effects'
import ariesProxy from '../../../proxies/aries-proxy'
import {actionTypes} from './CustomersActions'

const fetchCustomers = async _ => await ariesProxy.clients.get({includes: 'system,customer'})

function* doGetCustomers() {
  yield put({type: actionTypes.CUSTOMERS_GET_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(fetchCustomers)
    yield put({type:  actionTypes.CUSTOMERS_GET_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.CUSTOMERS_GET_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.CUSTOMERS_GET_REQUEST,  payload: { loading: false }})
  }
}
export function * getCustomers () {
  while (true) {
    yield take(actionTypes.CUSTOMERS_GET_REQUEST, doGetCustomers)
    yield doGetCustomers()
  }
}

export default function* rootSaga() {
  yield all([
    fork(getCustomers),
  ])
}
