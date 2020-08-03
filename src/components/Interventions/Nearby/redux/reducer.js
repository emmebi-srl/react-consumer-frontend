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
        error: null,
        results: results.map((result) => {
          result.isOpen = false;
          return result;
        }),
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

  [actionTypes.TOGGLE_IS_OPEN]: (state, action) => {
    const { systemId } = action.payload;
    return {
      ...state,
      searchList: {
        ...state.searchList,
        results: state.searchList.results.map((result) => {
          if (result.systemId === systemId) {
            return {
              ...result,
              isOpen: !result.isOpen,
            }
          }
          return result;
        }),
      }
    };
  },
};

export default {
  'nearby': createReducer({ ...initialState }, reducer)
};
