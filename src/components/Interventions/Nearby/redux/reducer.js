import {
  actionTypes,
} from './actions';
import createReducer from '../../../../store/create-reducers';


export const initialState = {
  searchForm: {
    system: null,
    address: '',
    city: '',
    postalCode: '',
  },
};


export const reducer  = {
  [actionTypes.SET_SEARCH_FORM_VALUE]: (state, action) => {
    const { key, value } = action.payload;
    return {
      ...state,
      searchForm: {
        ...state.searchForm,
        [key]: value,
      }
    };
  },
  [actionTypes.SET_SYSTEM]: (state, action) => {
    const { system } = action.payload;
    if (!system) return state;
    const destination = system.destination || {};

    return {
      ...state,
      searchForm: {
        ...state.searchForm,
        system,
        address: destination.street ? `${destination.street}, ${destination.streetNumber || ''}` : '',
        city: destination.municipality || '',
        postalCode: destination.postalCode || '',
      }
    };
  },
};

export default {
  'nearby': createReducer({ ...initialState }, reducer)
};
