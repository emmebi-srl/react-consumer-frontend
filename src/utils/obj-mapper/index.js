import {isArray} from '../is-array'
import {isObject} from '../is-object'

/**
 * Convert an API object that is not using a camelCase format to one in camelCase format. 
 * @param {any} apiObj 
 * @example {my_test: 1, my_acc: 'asdasd'} --> {myTest: 1, myAcc: 'asdasd'}
 */
export const apiObjToJsonObj = (apiObj, exceptedFields = []) => {
    let obj = isArray(apiObj) ? [] : Object.create({});

    return Object.keys(apiObj).reduce((_, key) => {
        const apiVal = apiObj[key];
        const newKey = exceptedFields.indexOf(key) === -1 
            ? key.toLowerCase().replace(/_([a-z])/g, (g) => (g[1].toUpperCase()))
            : key; 

        let convertedVal = null;
        if(isObject(apiVal)) { 
            convertedVal = apiObjToJsonObj(apiVal, exceptedFields);
        } else convertedVal = apiVal; 

        obj[newKey] = convertedVal;

        return obj;
    }, obj);
}

/**
 * Convert a JSON object to a API object (camelCase -> snake case)
 * @param {any} apiObj 
 * @example {myTest: 1, myAcc: 'asdasd'} --> {my_test: 1, my_acc: 'asdasd'}
 */
export const jsonObjToApiObj = (apiObj, exceptedFields = []) => {
    let obj = isArray(apiObj) ? [] : Object.create({});

    return Object.keys(apiObj).reduce((_, key) => {
        const apiVal = apiObj[key];
        const newKey = exceptedFields.indexOf(key) === -1 
            ? key.replace(/([A-Z])/g, (g)=> (`_${g.toLowerCase()}`))
            : key; 

        let convertedVal = null;
        if(isObject(apiVal)) { 
            convertedVal = jsonObjToApiObj(apiVal, exceptedFields);
        } else convertedVal = apiVal; 

        obj[newKey] = convertedVal;

        return obj;
    }, obj);
}
