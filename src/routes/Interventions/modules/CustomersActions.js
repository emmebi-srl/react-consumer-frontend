import { genActions, createRequestTypes } from '../../../store/actions'

// ======================================================
// Constants
// ======================================================
export const actionTypes = {
  ...createRequestTypes('INTERVENTIONS_GET'),
}


// ======================================================
// ACTIONS
// ======================================================
const createActions = genActions(actionTypes)
export const getInterventions = createActions('INTERVENTIONS_GET');
