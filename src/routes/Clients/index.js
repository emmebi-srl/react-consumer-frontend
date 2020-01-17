import ClientsView from './ClientsView'
import { injectReducer } from '../../store/reducers'
import ClientsReducer from './modules/ClientsReducer'
import ClientsSagas from './modules/ClientsSagas'

export default (store) => {
  injectReducer(store, { key: 'clients', reducer: ClientsReducer })
  store.runSaga(ClientsSagas)
  return ClientsView
}
