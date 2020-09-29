import createReducer from '../../../store/create-reducers'
import nearbyReducer from '../../../components/Interventions/Nearby/redux/reducer'
import { combineReducers } from 'redux';

const initialState = {}

const reducer = createReducer({ ...initialState }, {
});

export default combineReducers({
  root: reducer,
  ...nearbyReducer,
});