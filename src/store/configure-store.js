import { applyMiddleware, compose, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import {createLogger} from 'redux-logger'

import reducers from './reducers'
import sagas from './sagas'



export default (initialState = {}) => {
  // ======================================================
  // Saga Configuration
  // ======================================================
  const sagaMiddleware = createSagaMiddleware()

  const middleware = [sagaMiddleware]

  // if env is development push a logger middleware
  if (process.env.NODE_ENV === 'development'){
    const logger = createLogger();
    middleware.push(logger);
  }

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = []

  let composeEnhancers = compose

  // Exclude code from production
  if (process.env.NODE_ENV === 'development') {
    const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ // eslint-disable-line no-underscore-dangle
    if (typeof composeWithDevToolsExtension === 'function') {
      composeEnhancers = composeWithDevToolsExtension
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    reducers(),
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      ...enhancers,
    ),
  )
  store.asyncReducers = {}

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const defaultReducers = require('./reducers').default // eslint-disable-line global-require
      store.replaceReducer(defaultReducers(store.asyncReducers))
    })
  }

  store.runSaga = sagaMiddleware.run
  store.runSaga(sagas)

  return store
}
