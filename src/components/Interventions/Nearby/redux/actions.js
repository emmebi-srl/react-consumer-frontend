export const actionTypes = {
  SET_SEARCH_FORM_VALUE: 'INTERVENTIONS:NEARBY:SET_SEARCH_FORM_VALUE',
  SET_SYSTEM: 'INTERVENTIONS:NEARBY:SET_SYSTEM',
}

export const setSearchFormValue = (key, value) => ({
  type: actionTypes.SET_SEARCH_FORM_VALUE,
  payload: { key, value },
});

export const setSystem = (system) => ({
  type: actionTypes.SET_SYSTEM,
  payload: { system },
});
