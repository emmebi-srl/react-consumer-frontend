import { all } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import session from './session/sagas';

export default function* root(): SagaIterator {
  yield all([
    ...session
  ]);
}
