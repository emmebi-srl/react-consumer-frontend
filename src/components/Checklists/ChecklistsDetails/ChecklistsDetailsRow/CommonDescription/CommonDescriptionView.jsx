import React from 'react'
import PropTypes from 'prop-types'
import {List} from '../../../../UI'

const CommonDescription = ({value}) => {
  return (
    <List.Header>{value}</List.Header>
  )
};

// PropTypes
CommonDescription.propTypes = {
  value: PropTypes.string.isRequired, 
};

export default CommonDescription;