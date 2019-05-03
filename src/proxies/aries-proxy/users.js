module.exports.init = function(axios) {
  const getMe = () => {
    return axios.get('users/me');
  };

  const logout = () => {
    return axios.post('users/logout');
  };

  return {
    getMe,
    logout,
  }
}