import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectNearbyState } from '../redux/selectors';

const selectSearchList = createSelector(
  selectNearbyState,
  (state) => state.searchList,
);

const selectError = createSelector(
  selectSearchList,
  (state) => state.error,
);

const mapStateToProps = (state) => {
  return {
    error: selectError(state),
    hasError: !!selectError(state),
  }
};

const mapDispatchToActions = null;

export default connect(mapStateToProps, mapDispatchToActions);
