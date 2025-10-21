import createReducer from '../create-reducers';
import { actionTypes } from './actions';

interface AuthState {
  sending: boolean;
  error: string | null;
  isLogged: boolean;
}

interface SessionState {
  auth: AuthState;
  user: any; // You might want to define a proper User interface
}

interface Action {
  type: string;
  payload?: {
    sending?: boolean;
    error?: string;
    [key: string]: any;
  };
}

const initialState: SessionState = {
  auth: { sending: false, error: null, isLogged: false },
  user: null
};

export default createReducer(initialState, {
  
  [actionTypes.USER_LOGIN_REQUEST](state: SessionState, action: Action): SessionState {
    return { 
      ...state,
      auth: {
        ...state.auth,
        sending: action.payload?.sending ?? false,
      },
      user: null
    };
  },

  [actionTypes.USER_LOGIN_SUCCESS](state: SessionState): SessionState {
    return { 
      ...state,
      auth: {
        ...state.auth,
        error: null,
        isLogged: true,
      }
    };
  },

  [actionTypes.USER_LOGIN_FAILURE](state: SessionState, action: Action): SessionState {
    return { 
      ...state,
      auth: {
        ...state.auth,
        error: action.payload?.error ?? null,
        isLogged: false,
      }
    };
  },

  [actionTypes.RESET_LOGIN_ERROR](state: SessionState): SessionState {
    return { 
      ...state,
      auth: {
        ...state.auth,
        error: null,
      }
    };
  }
});
