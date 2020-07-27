import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectNearbyState } from '../redux/selectors';

const selectSearchList = createSelector(
  selectNearbyState,
  (state) => state.searchList,
);

const selectLoading = createSelector(
  selectSearchList,
  (state) => state.loading,
);

const selectError = createSelector(
  selectSearchList,
  (state) => state.loading,
);

const selectResults = createSelector(
  selectSearchList,
  (state) => state.results,
);

const mapStateToProps = (state) => ({
  results: selectResults(state),
  loading: selectLoading(state),
  error: selectError(state),
});

const mapDispatchToActions = null;

export default connect(mapStateToProps, mapDispatchToActions);
