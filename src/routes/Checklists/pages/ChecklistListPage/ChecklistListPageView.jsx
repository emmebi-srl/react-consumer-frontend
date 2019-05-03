import React from 'react'
import PropTypes from 'prop-types'
import ChecklistsList from '../../../../components/Checklists/ChecklistsList';

class ChecklistListPageView extends React.PureComponent {
  componentDidMount () {
    this.props.getChecklists()
  }
  render () {
    const {list, isLoading} = this.props.list
    return (
      <ChecklistsList isLoading={isLoading} data={{list}} />
    )
  }
}

ChecklistListPageView.propTypes = {
  list: PropTypes.object.isRequired, 
}

export default ChecklistListPageView