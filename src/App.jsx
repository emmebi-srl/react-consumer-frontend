import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import AppRoutes from './App.routes'
import { getLocalStorageItem, setLocalStorageItem } from './utils/local-storage';
import { ARIES_API_TOKEN } from './proxies/aries-proxy';
import { Dimmer, Loader } from './components/UI';
import {getParameterByName} from './utils/query-string'

const MainContainer = styled.div`
  height: 100%;
`

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isAutoLoginRunning: true,
    } 
  }

  componentDidMount() {
    let refreshToken = getParameterByName('refreshToken')

    if(!refreshToken) {
      const tokenData = getLocalStorageItem(ARIES_API_TOKEN)
      if(tokenData) refreshToken = tokenData.refresh_token 
    } else {
      setLocalStorageItem(ARIES_API_TOKEN, null)
    }

    if(refreshToken) this.props.autoLogin(refreshToken)
    else this.setState({isAutoLoginRunning: false})
  }

  componentDidUpdate() {
    if(this.state.isAutoLoginRunning) {
      const {isAuthPending, isLogged} = this.props
      if(!isAuthPending) {
        this.setState({isAutoLoginRunning: false})
        if(!isLogged) this.props.resetLoginError()
      }
    }
  }

  render() {
    const {isLogged, routes} = this.props
    const {isAutoLoginRunning} = this.state

    if(isAutoLoginRunning) {
      return <Dimmer inverted active={isAutoLoginRunning}>
        <Loader inverted />
      </Dimmer>
    }

    return <MainContainer>
      <AppRoutes isLogged={isLogged} routes={routes}/>
    </MainContainer>
  }
};

App.propTypes = {  
  autoLogin: PropTypes.func.isRequired, 
  resetLoginError: PropTypes.func.isRequired,
}

export default App;