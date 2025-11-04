/**
 * Get value from questy string value by key
 * @param {string} key
 */
export const getParameterByName = (key: string) => {
  return parseQueryString()[key];
};

/**
 * Get a key value object with queryStrings fields
 *
 */
export const parseQueryString = () => {
  const queryString = window.location.href.slice(window.location.href.indexOf('?') + 1);
  const params: Record<string, string> = {};

  // Split into key/value pairs
  const queries = queryString.split('&');

  // Convert the array of strings into an object
  for (let i = 0, l = queries.length; i < l; i++) {
    const temp = queries[i]?.split('=');
    if (temp?.[0] && temp[1]) {
      params[temp[0]] = temp[1];
    }
  }
  return params;
};
