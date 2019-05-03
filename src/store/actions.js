import * as sessionActions from './session/actions'

const REQUEST = 'REQUEST'
const SUCCESS = 'SUCCESS'
const FAILURE = 'FAILURE'

export const createRequestTypes = base => [
  `${base}_${REQUEST}`,
  `${base}_${SUCCESS}`,
  `${base}_${FAILURE}`,
].reduce((acc, curr) => ({ ...acc, [curr]: curr }), {})

export const createAction = (type, payload = {}) => ({ type, ...payload })

export const genActions = actionTypes => name => ({
  request: (payload = {}) => createAction(actionTypes[`${name}_${REQUEST}`], { payload }),
  success: payload => createAction(actionTypes[`${name}_${SUCCESS}`], { payload }),
  failure: payload => createAction(actionTypes[`${name}_${FAILURE}`], { payload }),
})

export default { 
    ...sessionActions,
};