import { all, call, fork, take, put } from 'redux-saga/effects'
import ariesProxy from '../../../proxies/aries-proxy'
import {actionTypes} from './InterventionsActions'

const fetchInterventions = async _ => await ariesProxy.clients.get({includes: 'system,customer'})

function* doGetInterventions() {
  yield put({type: actionTypes.INTERVENTIONS_GET_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(fetchInterventions)
    yield put({type:  actionTypes.INTERVENTIONS_GET_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.INTERVENTIONS_GET_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.INTERVENTIONS_GET_REQUEST,  payload: { loading: false }})
  }
}
export function * getInterventions () {
  while (true) {
    yield take(actionTypes.INTERVENTIONS_GET_REQUEST, doGetInterventions)
    yield doGetInterventions()
  }
}

export default function* rootSaga() {
  yield all([
    fork(getInterventions),
  ])
}
