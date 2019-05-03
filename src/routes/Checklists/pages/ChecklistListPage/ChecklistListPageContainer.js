import { connect } from 'react-redux'
import ChecklistListPageView from './ChecklistListPageView'
import {getChecklists} from '../../modules/ChecklistsActions'

const mapStateToProps = (state) => {
  return {
    list: {
      isLoading: state.checklists.checklists.loading,
      list: state.checklists.checklists.list || [],
    }
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    getChecklists: () => dispatch(getChecklists.request()),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ChecklistListPageView)