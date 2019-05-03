

import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import sessionReducers from './session/reducers'

export const makeRootReducer = asyncReducers => combineReducers({
  form: formReducer,
  session: sessionReducers,
  ...asyncReducers,
})

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer // eslint-disable-line no-param-reassign
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
