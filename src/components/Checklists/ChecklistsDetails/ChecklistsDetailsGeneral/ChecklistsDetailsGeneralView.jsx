import React from 'react'
import styled from 'styled-components'
import ChecklistsDetailsGeneralCustomerView from './ChecklistsDetailsGeneralCustomer'
import ChecklistsDetailsGeneralSystemView from './ChecklistsDetailsGeneralSystem'
import { LightGrey } from '../../../../styles';


const MainContainer = styled.div`
  border-top: 1px solid ${LightGrey};
  border-left: 1px solid ${LightGrey};
  margin-left: -1px;
`;

const Content = styled.div`
  overflow: hidden;
`;
const ChecklistsDetailsGeneral = () => {
  return (
    <MainContainer>
      <Content>
        <ChecklistsDetailsGeneralCustomerView />
        <ChecklistsDetailsGeneralSystemView />
      </Content>
    </MainContainer>
  )
};

// PropTypes
ChecklistsDetailsGeneral.propTypes = { };

export default ChecklistsDetailsGeneral;
