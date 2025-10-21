import { Action } from 'redux';

interface CustomAction<P> extends Action {
  type: string;
  payload?: P;
}

interface ReducerHandlers<S, P> {
  [actionType: string]: (state: S, action: CustomAction<P>) => S;
}

export default function createReducer<S, P>(initialState: S, handlers: ReducerHandlers<S, P>) {
  return (state: S = initialState, action: CustomAction<P>): S => {
    const handler = handlers[action.type];
    if (handler) {
      return handler(state, action);
    } else {
      return state;
    }
  };
}
