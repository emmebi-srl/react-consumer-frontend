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
    rangeKm: 10,
  },
  searchList: {
    loading: false,
    results: [],
    error: null,
  }
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
        address: destination.street ? `${destination.street}, ${destination.houseNumber || ''}` : '',
        city: destination.municipality || '',
        postalCode: destination.postalCode || '',
      }
    };
  },
  [actionTypes.GET_INTERVENTIONS]: (state) => {
    return {
      ...state,
      searchList: {
        ...state.searchList,
        loading: true,
      }
    };
  },
  [actionTypes.GET_INTERVENTIONS_SUCCESS]: (state, action) => {
    const { results } = action.payload;
    return {
      ...state,
      searchList: {
        ...state.searchList,
        loading: false,
        results,
      }
    };
  },
  [actionTypes.GET_INTERVENTIONS_ERROR]: (state, action) => {
    const { error } = action.payload;
    return {
      ...state,
      searchList: {
        ...state.searchList,
        loading: false,
        error,
      }
    };
  },
};

export default {
  'nearby': createReducer({ ...initialState }, reducer)
};