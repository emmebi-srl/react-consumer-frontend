import { connect } from 'react-redux'
import ChecklistActionsBarView from './ChecklistActionsBarView'
import {
  checklistDetailStartEditData, 
  createSystemChecklistAssoc, 
  remoteUpdate, 
  checklistDetailCancelEdit,
} from '../../../../routes/Checklists/modules/ChecklistsActions'

const mapStateToProps = (state) => {
  return {
    editMode: state.checklists.detail.edit,
    hasChecklistLink: !!(state.checklists.detail.data.system && state.checklists.detail.data.system.checklistId),
    checklist: { ...state.checklists.detail.data, system: undefined, customer: undefined }
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    startEditing: () => dispatch(checklistDetailStartEditData()),
    createSystemChecklistAssoc: (checklistId) => dispatch(createSystemChecklistAssoc.request({id: checklistId})),
    updateChecklist: (id, checklist) => dispatch(remoteUpdate.request({id, checklist})),
    cancelUpdate: _ => dispatch(checklistDetailCancelEdit())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ChecklistActionsBarView)