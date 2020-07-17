import { genActions, createRequestTypes } from '../../../store/actions'

// ======================================================
// Constants
// ======================================================
export const actionTypes = {
  ...createRequestTypes('CUSTOMERS_GET'),
}


// ======================================================
// ACTIONS
// ======================================================
const createActions = genActions(actionTypes)
export const getCustomers = createActions('CUSTOMERS_GET');
