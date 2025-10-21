import ChecklistsView from './ChecklistsView'
import { injectReducer } from '../../store/reducers'
import ChecklistsReducer from './modules/ChecklistsReducer'
import ChecklistsSagas from './modules/ChecklistsSagas'

export default (store) => {
  injectReducer(store, { key: 'checklists', reducer: ChecklistsReducer })
  store.runSaga(ChecklistsSagas)
  return ChecklistsView
}
