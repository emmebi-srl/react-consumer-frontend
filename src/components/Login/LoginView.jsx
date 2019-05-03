import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {withRouter} from 'react-router-dom'
import {Icon} from '../UI'
import PrimaryButton from '../UI/PrimaryButton'
import { Message, Form, Input, Header} from '../UI';

const messages = defineMessages({
  welcome: {id: 'WELCOME_TO_ARIES'},
  username: {id: 'USERNAME'},
  password: {id: 'PASSWORD'},
  login: {id: 'LOGIN'}, 
  invalidCredentials: {id: 'INVALID_LOGIN_CREDENTIALS_MESSAGE'}, 
  serverError: {id: 'UNEXPECTED_SERVER_ERROR_MESSAGE'}
})

const MainContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 0px;
`

const FormContainer = styled(Form)`
  display: inline-block;
  text-align: center;
  width:100%;
  max-width:350px!important;
`

const IconContainer = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;
`

const Field = styled.div`
  display: block;
  margin-bottom: 20px;
`

class Login extends React.Component  {
  constructor(props) {
    super(props)

    this.state = {
      username: null,
      password: null,
    };
  }

  componentDidUpdate(){
    const  {isLogged, history}  = this.props;
    if(isLogged) history.replace('/');
  }


  render() {
    const {intl: {formatMessage}, isLoading, execLogin, errorStatusCode}  = this.props;
    const {username, password} = this.state;

    const getErrorMessage = () => {
      if(errorStatusCode && errorStatusCode >= 400 && errorStatusCode <= 599){
        let myMsg = errorStatusCode === 400? messages.invalidCredentials : messages.serverError;

        return <Message negative>
          <Message.Header>{formatMessage(myMsg)}</Message.Header>
        </Message>
      }
      return null;
    };

    return (
      <MainContainer>
        <FormContainer>
          <Header 
            text={formatMessage(messages.welcome)}>
          </Header>
          <IconContainer>
            <Icon 
              name="user circle"
              size="massive">
            </Icon>
          </IconContainer>

          <Field>
            <Input  
              fluid
              icon='user' 
              size='large' 
              iconPosition='left' 
              autoComplete='username'
              placeholder={formatMessage(messages.username)} 
              value={username || ''}
              onChange={e => this.setState({username: e.target.value})} />
          </Field>
          <Field>
            <Input 
              fluid
              icon='lock' 
              size='large' 
              iconPosition='left' 
              type='password'
              autoComplete='current-password'
              placeholder={formatMessage(messages.password)}
              value={password || ''}
              onChange={e => this.setState({password: e.target.value})} />
          </Field>
          <PrimaryButton
            fluid
            size='large'
            loading={isLoading}
            disabled={isLoading}
            text={formatMessage(messages.login)}
            onClick={() => execLogin(username, password)}>
          
          </PrimaryButton>

          {getErrorMessage(errorStatusCode)}
        </FormContainer>
      </MainContainer>
    )
  };
};

// PropTypes
Login.propTypes = {
  intl: intlShape.isRequired,
  execLogin: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorStatusCode: PropTypes.number
};


export default withRouter(injectIntl(Login));