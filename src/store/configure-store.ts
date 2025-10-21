import { applyMiddleware, compose, configureStore, Store, Reducer } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';

import reducers from './reducers';
import sagas from './sagas';

interface WindowWithReduxDevtools extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}

interface StoreWithAsyncReducers extends Store {
  asyncReducers: { [key: string]: Reducer };
  runSaga: SagaMiddleware['run'];
}

declare const module: {
  hot?: {
    accept(path: string, callback: () => void): void;
  };
};

export default (initialState: any = {}): StoreWithAsyncReducers => {
  // ======================================================
  // Saga Configuration
  // ======================================================
  const sagaMiddleware = createSagaMiddleware();

  const middleware: any[] = [sagaMiddleware];

  // if env is development push a logger middleware
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createLogger } = require('redux-logger');
    const logger = createLogger();
    middleware.push(logger);
  }

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers: any[] = [];

  let composeEnhancers = compose;

  // Exclude code from production
  if (process.env.NODE_ENV === 'development') {
    const windowWithDevtools = window as WindowWithReduxDevtools;
    const composeWithDevToolsExtension = windowWithDevtools.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (typeof composeWithDevToolsExtension === 'function') {
      composeEnhancers = composeWithDevToolsExtension;
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = configureStore(
    reducers(),
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      ...enhancers,
    ),
  );
  
  // Add custom properties to the store
  const storeWithAsync = store as any;
  storeWithAsync.asyncReducers = {};

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const defaultReducers = require('./reducers').default;
      storeWithAsync.replaceReducer(defaultReducers(storeWithAsync.asyncReducers));
    });
  }

  storeWithAsync.runSaga = sagaMiddleware.run;
  storeWithAsync.runSaga(sagas);

  return storeWithAsync as StoreWithAsyncReducers;
};
