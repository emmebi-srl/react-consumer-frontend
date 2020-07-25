const init = function(axios) {
  const getToDoByAddress = ({ city, address, distance, postalCode }) => {
    return axios.get('work/todo/address', {
      params: { city, address, distance, postalCode },
    });
  };
  return {
    getToDoByAddress,
  }
};

export default {
  init,
};
