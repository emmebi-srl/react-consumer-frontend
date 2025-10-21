import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Route} from 'react-router-dom'
import ChecklistListPage from './pages/ChecklistListPage'
import ChecklistDetailPage from './pages/ChecklistDetailPage'


class ChecklistsView extends React.PureComponent {
  render () {
    const {match} = this.props
    return (
      <Switch>
        <Route exact path={`${match.url}/`} component={ChecklistListPage}></Route>
        <Route path={`${match.url}/:id`} component={ChecklistDetailPage}></Route>
      </Switch>
    )
  }
}

ChecklistsView.propTypes = {
  match: PropTypes.object.isRequired,
}

export default ChecklistsView