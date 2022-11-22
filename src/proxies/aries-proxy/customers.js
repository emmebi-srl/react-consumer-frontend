const init = function(axios) {
  const search = (value) => {
    return axios.get('customers');
  };
  return {
    search,
  }
};

export default {
  init,
};
  