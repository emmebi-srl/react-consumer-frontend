import { setSearchFormValue, setSystem } from '../redux/actions';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectNearbyState } from '../redux/selectors';

const searchFormSelector = createSelector(
  selectNearbyState,
  (state) => state.searchForm
);

const mapStateToProps = (state) => ({
  searchForm: searchFormSelector(state),
});

const mapDispatchToActions = {
  setSearchFormValue,
  setSystem,
};

export default connect(mapStateToProps, mapDispatchToActions);
