import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectNearbyState } from '../redux/selectors';
import { toggleIsOpen } from '../redux/actions';

const WORK_TYPE_MAINTENANCE = 2;
const WORK_TYPE_TICKET = 1;

const selectSearchMap = createSelector(
  selectNearbyState,
  (state) => state.searchList,
);

const selectLoading = createSelector(
  selectSearchMap,
  (state) => state.loading,
);

const selectResults = createSelector(
  selectSearchMap,
  (state) => {
    return state.results.map(result => {
      return {
        ...result,
        items: {
          maintenance: result.items.find(el => el.workType === WORK_TYPE_MAINTENANCE) || null,
          tickets: result.items.filter(el => el.workType === WORK_TYPE_TICKET) || [],
        }
      }
    });
  }
);

const mapStateToProps = (state) => ({
  results: selectResults(state),
  loading: selectLoading(state),
});

const mapDispatchToActions = {
  toggleIsOpen,
};

export default connect(mapStateToProps, mapDispatchToActions);
