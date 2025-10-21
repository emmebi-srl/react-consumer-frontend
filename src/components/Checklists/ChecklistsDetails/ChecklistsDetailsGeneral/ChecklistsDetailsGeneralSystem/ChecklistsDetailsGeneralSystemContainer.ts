import { connect } from 'react-redux'
import ChecklistsDetailsGeneralSystemView from './ChecklistsDetailsGeneralSystemView'

const mapStateToProps = (state) => {
  const data = state.checklists.detail.data;
  return {
    data: {
      systemId: data.systemId,
      description: data.system.description, 
      systemCentral: data.systemCentral, 
      systemInstalledDate: data.systemInstalledDate, 
      systemInstalledPlace: data.systemInstalledPlace, 
      visitNumber: data.visitNumber, 
      periodicCheck: data.periodicCheck, 
      systemDepartments: data.systemDepartments,
    },
    editMode: state.checklists.detail.edit,
  }
}

export default connect(mapStateToProps)(ChecklistsDetailsGeneralSystemView)