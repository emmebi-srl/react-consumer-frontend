import { all } from 'redux-saga/effects'
import nearbySagas from '../../../components/Interventions/Nearby/redux/sagas'


export default function* rootSaga() {
  yield all([
    ...nearbySagas,
  ])
}
