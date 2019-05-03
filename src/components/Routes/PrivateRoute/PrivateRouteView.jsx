import React from 'react'
import {Route, Redirect, withRouter} from 'react-router-dom'

const PrivateRouteView = ({component: Component, isLogged, extProps, ...rest}) => { 
  return (
    <Route
      {...rest}
      render={(props) => isLogged === true
        ? <Component {...extProps} {...props} />
        : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
    />
  )
}

export default withRouter(PrivateRouteView)