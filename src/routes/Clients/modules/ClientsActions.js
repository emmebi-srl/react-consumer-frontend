import { genActions, createRequestTypes } from '../../../store/actions'

// ======================================================
// Constants
// ======================================================
export const actionTypes = {
  ...createRequestTypes('CLIENTS_GET'),
}


// ======================================================
// ACTIONS
// ======================================================
const createActions = genActions(actionTypes)
export const getClients = createActions('CLIENTS_GET');
