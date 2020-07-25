import {takeEvery, put, fork} from 'redux-saga/effects'
import ariesProxy from '../../../../proxies/aries-proxy'
import {actionTypes, getInterventionsSuccess, getInterventionsError} from './actions'

export function * fetchInterventionsNearby (action) {
  const { address, city, rangeKm, postalCode } = action.payload.filter;
  try {
    const { list } = yield ariesProxy.works.getToDoByAddress({ address, city, distance: rangeKm, postalCode });
    yield put(getInterventionsSuccess({ list }))
  } catch (error) {
    yield put(getInterventionsError({ error: error.response || error }))
  }
}

export function * getInterventionsNearby () {
  yield takeEvery(actionTypes.GET_INTERVENTIONS, fetchInterventionsNearby)
}

export default [
  fork(getInterventionsNearby),
]