import { genActions } from '../../../store/actions'

// ======================================================
// Constants
// ======================================================
export const actionTypes = {}


// ======================================================
// ACTIONS
// ======================================================
const createActions = genActions(actionTypes)
export const getInterventions = createActions('');
