import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape} from 'react-intl'
import {withRouter} from 'react-router-dom'
import PrivateAreaRoutes from './PrivateAreaRoutes';
import Header from '../Header';
import NavbarView from '../Navbar/NavbarView';

const MainContainer = styled.div`
  height: 100%;
  padding: 0px;
`
const Content = styled.div`
  padding: 0px;
  width: 100%;
  overflow: hidden;
`
const PrivateArea = ({routes}) => {
  return (
    <MainContainer>
      <Header/>
      <NavbarView/>
      <Content>
        <PrivateAreaRoutes routes={routes}/>
      </Content>
    </MainContainer>
  )
};

// PropTypes
PrivateArea.propTypes = {
  routes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    exact: PropTypes.bool.isRequired,
    component: PropTypes.func.isRequired,
  }))).isRequired,
  intl: intlShape,
};


export default withRouter(injectIntl(PrivateArea));