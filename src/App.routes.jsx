import React from 'react' 
import PropTypes from 'prop-types'
import {Switch, Route, Redirect, withRouter} from 'react-router-dom'
import Login from './components/Login'
import PrivateAreaView from './components/PrivateArea';
import PrivateRoute from './components/Routes/PrivateRoute';


class AppRoutesComponent extends React.PureComponent {
  render () {
    const {isLogged, routes} = this.props
    return (
      <Switch>
        <Route exact path='/login' component={Login}></Route>      
        {
          isLogged === true 
          ? null
          : <Redirect to='/login' />
        }
        <PrivateRoute isLogged={isLogged} path='/' component={PrivateAreaView} extProps={{routes}}></PrivateRoute>
      </Switch>)
  }
}

AppRoutesComponent.propTypes = {  
  routes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    exact: PropTypes.bool.isRequired,
    component: PropTypes.func.isRequired,
  }))).isRequired,
}


export default withRouter(AppRoutesComponent)
