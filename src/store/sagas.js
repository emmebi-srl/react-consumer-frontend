import { all } from 'redux-saga/effects'
import session from './session/sagas'

export default function* root() {
    yield all([
      ...session
    ])
  }
  