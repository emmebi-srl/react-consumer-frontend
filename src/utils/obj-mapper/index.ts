import _isObject from 'lodash/isObject';
import _isArray from 'lodash/isArray';

/**
 * Convert an API object that is not using a camelCase format to one in camelCase format.
 * @param {any} apiObj
 * @example {my_test: 1, my_acc: 'asdasd'} --> {myTest: 1, myAcc: 'asdasd'}
 */
export const apiObjToJsonObj = (apiObj: unknown, exceptedFields: string[] = []): unknown => {
  if (!apiObj || (!_isObject(apiObj) && !_isArray(apiObj))) return apiObj;

  if (_isArray(apiObj)) {
    return apiObj.map((item) => apiObjToJsonObj(item, exceptedFields));
  }

  return Object.entries(apiObj).reduce(
    (obj, [key, apiVal]) => {
      const newKey = !exceptedFields.includes(key)
        ? key.toLowerCase().replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() ?? '')
        : key;

      let convertedVal = null;
      if (_isObject(apiVal)) {
        convertedVal = apiObjToJsonObj(apiVal, exceptedFields);
      } else convertedVal = apiVal;

      obj[newKey] = convertedVal;

      return obj;
    },
    {} as Record<string, unknown>,
  );
};

/**
 * Convert a JSON object to a API object (camelCase -> snake case)
 * @param {any} jsonObj
 * @example {myTest: 1, myAcc: 'asdasd'} --> {my_test: 1, my_acc: 'asdasd'}
 */
export const jsonObjToApiObj = (jsonObj: unknown, exceptedFields: string[] = []): unknown => {
  if (!jsonObj || !_isObject(jsonObj) || !_isArray(jsonObj)) return jsonObj;

  if (_isArray(jsonObj)) {
    return jsonObj.map((item) => apiObjToJsonObj(item, exceptedFields));
  }

  return Object.entries(jsonObj).reduce(
    (obj, [key, apiVal]) => {
      const newKey = !exceptedFields.includes(key) ? key.replace(/([A-Z])/g, (g) => `_${g.toLowerCase()}`) : key;

      let convertedVal = null;
      if (_isObject(apiVal)) {
        convertedVal = jsonObjToApiObj(apiVal, exceptedFields);
      } else convertedVal = apiVal;

      obj[newKey] = convertedVal;

      return obj;
    },
    {} as Record<string, unknown>,
  );
};
