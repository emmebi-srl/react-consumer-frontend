import CustomersView from './CustomersView'
import { injectReducer } from '../../store/reducers'
import CustomersReducer from './modules/CustomersReducer'
import CustomersSagas from './modules/CustomersSagas'

export default (store) => {
  injectReducer(store, { key: 'customers', reducer: CustomersReducer })
  store.runSaga(CustomersSagas)
  return CustomersView
}
