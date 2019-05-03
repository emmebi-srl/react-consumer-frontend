import React from 'react' 
import PropTypes from 'prop-types'
import {Switch, Route, Redirect, withRouter} from 'react-router-dom'

class PrivateAreaRoutes extends React.PureComponent {
  
  render () {
    const {routes, match} = this.props
    const initMatch = match.url === '/' ? '' : match.url;
    return (
      <Switch>
        {
          routes.routes.map(({ component, ...otherRouteProp }) => (
            <Route key={otherRouteProp.path} exact={otherRouteProp.exact} path={`${initMatch}${otherRouteProp.path}`} component={component}/>
          ))
        }
        <Redirect to={`${initMatch}/checklists`} />
      </Switch>)
  }
}

PrivateAreaRoutes.propTypes = {  
  routes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    exact: PropTypes.bool.isRequired,
    component: PropTypes.func.isRequired,
  }))).isRequired,
}

export default withRouter(PrivateAreaRoutes)