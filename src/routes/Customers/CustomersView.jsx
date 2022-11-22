import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Route} from 'react-router-dom'
import CustomerListPage from './pages/CustomerListPage/CustomerListPage'


class CustomersView extends React.PureComponent {
  render () {
    const { match } = this.props
    return (
      <Switch>
        <Route exact path={`${match.url}/`} component={CustomerListPage}></Route>
      </Switch>
    )
  }
}

CustomersView.propTypes = {
  match: PropTypes.object.isRequired,
}

export default CustomersView;
