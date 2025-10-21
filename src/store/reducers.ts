import { combineReducers, Reducer } from 'redux';
import sessionReducers from './session/reducers';

interface AsyncReducers {
  [key: string]: Reducer;
}

export const makeRootReducer = (asyncReducers: AsyncReducers) => combineReducers({
  session: sessionReducers,
  ...asyncReducers,
});

interface StoreWithAsyncReducers {
  asyncReducers: AsyncReducers;
  replaceReducer: (reducer: Reducer) => void;
}

export const injectReducer = (store: StoreWithAsyncReducers, { key, reducer }: { key: string; reducer: Reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

  store.asyncReducers[key] = reducer; // eslint-disable-line no-param-reassign
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
