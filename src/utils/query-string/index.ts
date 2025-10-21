/**
 * Get value from questy string value by key
 * @param {string} key 
 */
export const getParameterByName = (key) => {
  return parseQueryString()[key];
}

/**
 * Get a key value object with queryStrings fields
 * 
 */
export const parseQueryString = () => {
  const queryString = window.location.href.slice(window.location.href.indexOf('?') + 1);
  let params = {}, queries, temp, i, l;

  // Split into key/value pairs
  queries = queryString.split("&");

  // Convert the array of strings into an object
  for ( i = 0, l = queries.length; i < l; i++ ) {
      temp = queries[i].split('=');
      params[temp[0]] = temp[1];
  }
  return params;
}

