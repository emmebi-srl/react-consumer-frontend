import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Route, Redirect} from 'react-router-dom'
import InterventionsNearbyPage from './pages/InterventionsNearbyPage'


class InterventionsView extends React.PureComponent {
  render () {
    const { match } = this.props
    return (
      <Switch>
        <Route exact path={`${match.url}/nearby`} component={InterventionsNearbyPage}></Route>
        <Redirect to={`${match.url}/nearby`} />
      </Switch>
    )
  }
}

InterventionsView.propTypes = {
  match: PropTypes.object.isRequired,
}

export default InterventionsView;
