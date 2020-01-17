import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Route} from 'react-router-dom'


class ChecklistsView extends React.PureComponent {
  render () {
    const { match } = this.props
    return (
      <Switch>
        <Route exact path={`${match.url}/`} component={() => <div></div>}></Route>
      </Switch>
    )
  }
}

ChecklistsView.propTypes = {
  match: PropTypes.object.isRequired,
}

export default ChecklistsView