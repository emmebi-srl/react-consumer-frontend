export const actionTypes = {
  SET_SEARCH_FORM_VALUE: 'INTERVENTIONS:NEARBY:SET_SEARCH_FORM_VALUE',
  SET_SYSTEM: 'INTERVENTIONS:NEARBY:SET_SYSTEM',
  GET_INTERVENTIONS: 'INTERVENTIONS:NEARBY:GET_INTERVENTIONS',
  GET_INTERVENTIONS_SUCCESS: 'INTERVENTIONS:NEARBY:GET_INTERVENTIONS_SUCCESS',
  GET_INTERVENTIONS_ERROR: 'INTERVENTIONS:NEARBY:GET_INTERVENTIONS_ERROR',
}

export const setSearchFormValue = (key, value) => ({
  type: actionTypes.SET_SEARCH_FORM_VALUE,
  payload: { key, value },
});

export const setSystem = (system) => ({
  type: actionTypes.SET_SYSTEM,
  payload: { system },
});

export const getInterventions = (filter) => ({
  type: actionTypes.GET_INTERVENTIONS,
  payload: { filter },
});

export const getInterventionsSuccess = ({ list }) => ({
  type: actionTypes.GET_INTERVENTIONS_SUCCESS,
  payload: { results: list },
});

export const getInterventionsError = ({ error }) => ({
  type: actionTypes.GET_INTERVENTIONS_ERROR,
  payload: { error },
});
