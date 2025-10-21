import { connect } from 'react-redux'
import ChecklistsDetailsGeneralCustomerView from './ChecklistsDetailsGeneralCustomerView'

const mapStateToProps = (state) => {
  const data = state.checklists.detail.data;
  return {
    data: {
      customerId: data.customerId,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      customerCity: data.customerCity,
      responsableName: data.responsableName,
      responsableJob: data.responsableJob,
    },
    editMode: state.checklists.detail.edit,
  }
}
export default connect(mapStateToProps)(ChecklistsDetailsGeneralCustomerView)