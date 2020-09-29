import { setSearchFormValue, setSystem, getInterventions } from '../redux/actions';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import querystring from 'query-string';
import { selectNearbyState } from '../redux/selectors';

const searchFormSelector = createSelector(
  selectNearbyState,
  (state) => state.searchForm
);

const allowSumitSelector = createSelector(
  searchFormSelector,
  (state) => state.address || state.city || state.postalCode
);

const mapStateToProps = (state, props) => {
  return {
    searchForm: searchFormSelector(state),
    allowSubmit: !!allowSumitSelector(state),
    querystring: querystring.parse(props.location.search),
  }
};

const mapDispatchToActions = {
  setSearchFormValue,
  setSystem,
  getInterventions,
};

export default connect(mapStateToProps, mapDispatchToActions);
