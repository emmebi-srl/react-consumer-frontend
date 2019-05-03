module.exports.init = function(axios) {
  const get = ({includes}) => {
    return axios.get('checklist', {
      params: {
        includes,
      }
    })
  }
  const getById = ({includes, id}) => {
    return axios.get('checklist', {
      params: {
        includes,
        id
      }
    })
  }

  const getPdf = ({ id }) => axios.get(`checklist/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
  });

  const update = ({id, checklist}) => {
    return axios.put(`checklist/${id}`, checklist)
  }


  const createSystemLink = ({id}) => {
    return axios.post('checklist/model/createForSystem', {checklistId: id})
  }

  return {
    get,
    getById,
    update, 
    createSystemLink,
    getPdf,
  }
}