import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {defineMessages, injectIntl} from 'react-intl'
import {Input, Form} from '../../../../UI'
import {media, FormCard} from '../../../../../styles'
import HeaderRow from '../../ChecklistsDetailsRow/HeaderRow/HeaderRowView'

const messages = defineMessages({
  customer: { id: 'CUSTOMER' },
  customerName: { id: 'COMPANY_NAME' },
  customerAddress: { id: 'ADDRESS' },
  customerCity: { id: 'CITY' },
  responsible: { id: 'RESPONSIBLE' },
  task: { id: 'TASK' },
})

const FormField = styled(Form.Field)`
  display: block;
  width: 100%;
  ${media.tablet`
    display: inline-block;
    width: 32%;
  `}
  ${media.desktop`
    display: inline-block;
    width: 18.4%;
  `}
`

const MainContainer = styled.div`

`
const DesktopSeparator = styled.div`
  display: none;
  ${media.desktop`
    display: inline-block;
    width: 2%;
  `}
`

const TabletSeparator = styled(DesktopSeparator)`
  display: none;
  ${media.tablet`
    display: inline-block;
    width: 2%;
  `}
`

const FormWrapper = FormCard;

const ChecklistsDetailsGeneralCustomer = ({data, intl, editMode}) => {

  const {formatMessage} = intl;
  const readonly = !editMode;
  const {
    responsableJob, 
    customerName, 
    customerAddress, 
    customerCity, 
    responsableName, 
    customerId
  } = data;

  return (
    <MainContainer>
      <HeaderRow data={{header: `${formatMessage(messages.customer)} - ${customerId}`}}/>
      <FormWrapper>
        <FormField>
          <label>{formatMessage(messages.customerName)}</label>
          <Input 
            readOnly={readonly}            
            value={customerName}
            type='text' />
        </FormField>
        <TabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.customerAddress)}</label>
          <Input    
            readOnly={readonly}             
            value={customerAddress}
            type='text' />
        </FormField>       
        <TabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.customerCity)}</label>
          <Input
            readOnly={readonly}                 
            value={customerCity}
            type='text' />
        </FormField>   
        <DesktopSeparator/>     
        <FormField>
          <label>{formatMessage(messages.responsible)}</label>
          <Input 
            readOnly={readonly}                
            value={responsableName || ''}
            type='text' />
        </FormField>       
        <TabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.task)}</label>
          <Input
            readOnly={readonly}                 
            value={responsableJob || ''}
            type='text' />
        </FormField>
      </FormWrapper>
    </MainContainer>
  )
};

// PropTypes
ChecklistsDetailsGeneralCustomer.propTypes = {
  intl: PropTypes.object.isRequired,
  data: PropTypes.shape({
    responsableJob: PropTypes.string, 
    customerName: PropTypes.string.isRequired,
    customerAddress: PropTypes.string.isRequired,
    customerCity: PropTypes.string.isRequired,
    responsableName: PropTypes.string,
    customerId: PropTypes.number.isRequired,
  }),
  editMode: PropTypes.bool,
};

export default injectIntl(ChecklistsDetailsGeneralCustomer);