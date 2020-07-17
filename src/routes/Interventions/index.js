import InterventionsView from './InterventionsView'
import { injectReducer } from '../../store/reducers'
import InterventionsReducer from './modules/InterventionsReducer'
import InterventionsSagas from './modules/InterventionsSagas'

export default (store) => {
  injectReducer(store, { key: 'interventions', reducer: InterventionsReducer })
  store.runSaga(InterventionsSagas)
  return InterventionsView
}
