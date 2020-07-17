import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Route} from 'react-router-dom'


class InterventionsView extends React.PureComponent {
  render () {
    const { match } = this.props
    return (
      <Switch>
        <Route exact path={`${match.url}/`} component={() => <div></div>}></Route>
      </Switch>
    )
  }
}

InterventionsView.propTypes = {
  match: PropTypes.object.isRequired,
}

export default InterventionsView;
