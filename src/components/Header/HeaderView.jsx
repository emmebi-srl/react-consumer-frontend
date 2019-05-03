import React from 'react'
import styled from 'styled-components';
import { BackgroundNavbar, CenterVertically } from '../../styles';
import { Header } from '../UI';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  aries: {id: 'ARIES'},
})

const MainContainer = styled.div`
  position: relative;
  height: 50px;
  width:100%;
  padding: 0 16px;
  ${BackgroundNavbar}
`

const Logo = styled(Header)`
  display: inline-block;
  ${CenterVertically}
`

const HeaderView = ({intl}) => {

  const {formatMessage} = intl;

  return (
    <MainContainer>
      <Logo dimension={'h1'} text={formatMessage(messages.aries)}/>
    </MainContainer>
  )
}

export default injectIntl(HeaderView)
