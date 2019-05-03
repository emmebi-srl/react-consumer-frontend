import { connect } from 'react-redux'
import HeaderRowView from './HeaderRowView'

const mapStateToProps = (state, initialProps) => {
  const { rowIndex, paragraphIndex } = initialProps;

  return {
    data: state.checklists.detail.data.paragraphs[paragraphIndex].rows[rowIndex].data.nameValuePairs,
  }
}
export default connect(mapStateToProps)(HeaderRowView)