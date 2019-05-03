import { connect } from 'react-redux'
import App from './App'
import { autoLogin, resetLoginError } from './store/session/actions'

const mapStateToProps = (state) => {
  return { 
    isLogged: state.session.auth.isLogged, 
    isAuthPending: state.session.auth.sending, 
  }
}; 
const mapDispatchToProps = (dispatch) => {
  return {
    autoLogin: (refreshToken) => dispatch(autoLogin({refreshToken})),
    resetLoginError: () => dispatch(resetLoginError())
  }
};
export default connect(mapStateToProps, mapDispatchToProps, null, {
  pure: false
})(App); 