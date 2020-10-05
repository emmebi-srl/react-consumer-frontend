import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectNearbyState } from './redux/selectors';
import { setMapViewType, setListViewType } from './redux/actions';

const selectViewType = createSelector(
  selectNearbyState,
  (state) => state.interventionViewType,
);

const selectOpenedMap = createSelector(
  selectNearbyState,
  (state) => state.openedMap,
);
const mapStateToProps = (state) => ({
  viewType: selectViewType(state),
  openedMap: selectOpenedMap(state),
});

const mapDispatchToActions = {
  setMapViewType,
  setListViewType
};

export default connect(mapStateToProps, mapDispatchToActions);
