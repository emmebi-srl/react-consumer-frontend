import createReducer from '../create-reducers'
import {actionTypes} from './actions'

const initialState = {
  auth: {sending: false, error: null, isLogged: false}, 
  user: null
}

export default createReducer({ ...initialState }, {
  
  [actionTypes.USER_LOGIN_REQUEST](state, action){
    return { ...state,
        auth: {
            ...state.auth, 
            sending: action.payload.sending,
        }, 
        user: null
    }
  },
  [actionTypes.USER_LOGIN_SUCCESS](state){
    return { ...state, 
        auth: {
            ...state.auth, 
            error: null,
            isLogged: true,
        }
    }
  },
  [actionTypes.USER_LOGIN_FAILURE](state, action){
    return { ...state, 
        auth: {
            ...state.auth,
            error: action.payload.error,
            isLogged: false,
        }
    }
  },
  [actionTypes.RESET_LOGIN_ERROR](state){
    return { ...state,
      auth: {
        ...state.auth,
        error: null,
      }
    }
  }
})