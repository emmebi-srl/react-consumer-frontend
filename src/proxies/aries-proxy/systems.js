const init = function(axios) {
  const search = (value) => {
    return axios.get('system/search', {
      params: {
        value,
        fields: 'description,company_name,system_id'
      }
    });
  };
  return {
    search,
  }
};

export default {
  init,
};
