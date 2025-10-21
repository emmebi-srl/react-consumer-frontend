interface RequestTypes {
  [key: string]: string;
}

interface Action {
  type: string;
  payload?: any;
}

interface ActionCreators {
  request: (payload?: any) => Action;
  success: (payload?: any) => Action;
  failure: (payload?: any) => Action;
}

const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

export const createRequestTypes = (base: string): RequestTypes => [
  `${base}_${REQUEST}`,
  `${base}_${SUCCESS}`,
  `${base}_${FAILURE}`,
].reduce((acc, curr) => ({ ...acc, [curr]: curr }), {});

export const createAction = (type: string, payload: any = {}): Action => ({ type, ...payload });

export const genActions = (actionTypes: RequestTypes) => (name: string): ActionCreators => {
  const requestType = actionTypes[`${name}_${REQUEST}`];
  const successType = actionTypes[`${name}_${SUCCESS}`];
  const failureType = actionTypes[`${name}_${FAILURE}`];
  
  if (!requestType || !successType || !failureType) {
    throw new Error(`Action types for ${name} are not properly defined`);
  }
  
  return {
    request: (payload: any = {}) => createAction(requestType, { payload }),
    success: (payload?: any) => createAction(successType, { payload }),
    failure: (payload?: any) => createAction(failureType, { payload }),
  };
};
