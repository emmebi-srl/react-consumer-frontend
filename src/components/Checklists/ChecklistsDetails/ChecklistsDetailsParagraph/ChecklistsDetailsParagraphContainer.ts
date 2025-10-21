import { connect } from 'react-redux'
import ChecklistsDetailsParagraphView from './ChecklistsDetailsParagraphView'

const mapStateToProps = (state, initialProps) => {
  const { paragraphIndex } = initialProps;
  const paragraph = state.checklists.detail.data.paragraphs[paragraphIndex];
  
  return {
    data: {
      rows: (paragraph.rows || []).map(row => ({
        id: row.id, 
        rowType: row.rowType, 
        paragraphId: row.paragraphId, 
      })),
    },
    editMode: state.checklists.detail.edit,
  }
}
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChecklistsDetailsParagraphView)