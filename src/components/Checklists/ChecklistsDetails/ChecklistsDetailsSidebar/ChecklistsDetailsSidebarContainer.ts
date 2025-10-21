import { connect } from 'react-redux'
import ChecklistsDetailsSidebarView from './ChecklistsDetailsSidebarView'
import {checklistDetailParagraphActive, checklistDetailGeneralInfoActive} from '../../../../routes/Checklists/modules/ChecklistsActions'

const mapStateToProps = (state, initialProps) => {
  const { data } = state.checklists.detail || {};
  const paragraphs = (data && data.paragraphs) || [];
  return {
    paragraphs: paragraphs.map((paragraph) => ({
      order: paragraph.order, 
      name: paragraph.name,
    })),
    isGeneralInfoActive: data.isGeneralInfoActive,
    activeParagraphIndex: data.activeParagraphIndex,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    changeActiveParagraph: ({paragraphIndex}) => dispatch(checklistDetailParagraphActive({paragraphIndex})),
    activeGeneralInfo: () => dispatch(checklistDetailGeneralInfoActive()),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ChecklistsDetailsSidebarView)