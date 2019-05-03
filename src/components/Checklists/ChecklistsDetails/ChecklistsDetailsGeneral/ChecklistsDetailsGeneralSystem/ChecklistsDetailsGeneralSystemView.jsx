import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {defineMessages, injectIntl} from 'react-intl'
import {Input, Form} from '../../../../UI'
import {media, FormCard} from '../../../../../styles'
import HeaderRow from '../../ChecklistsDetailsRow/HeaderRow/HeaderRowView'
import AriesDate from '../../../../UI/AriesDate';

const messages = defineMessages({
  system: { id: 'SYSTEM' },
  systemId: {id: 'SYSTEM_ID'},
  description: {id: 'DESCRIPTION'},
  central: {id: 'CENTRAL'},
  installedOn: {id: 'INSTALLED_ON'},
  installedIn: {id: 'INSTALLED_IN'},
  visitNumber: {id: 'VISIT_NUMBER'},
  periodicCheck: {id: 'PERIODIC_CHECK'},
  departments: {id: 'DEPARTMENTS'}
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

const OnlyTabletSeparator = styled(DesktopSeparator)`
  display: none;
  ${media.tablet`
    display: inline-block;
    width: 2%;
  `}
  ${media.desktop`
    display: none;
  `}
`


const FormWrapper = FormCard


const ChecklistsDetailsGeneralSystem = ({data, intl, editMode}) => {
  const {formatMessage} = intl;
  const readonly = !editMode;
  const {
    systemId,
    description, 
    systemCentral, 
    systemInstalledDate, 
    systemInstalledPlace, 
    visitNumber, 
    periodicCheck, 
    systemDepartments,
  } = data;

  return (
    <MainContainer>
      <HeaderRow data={{header: `${formatMessage(messages.system)} - ${systemId}`}}/>
      <FormWrapper>
        <FormField>
          <label>{formatMessage(messages.description)}</label>
          <Input 
            readOnly={readonly}            
            value={description}
            type='text' />
        </FormField>
        <TabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.central)}</label>
          <Input  
            readOnly={readonly}                
            value={systemCentral || ''}
            type='text' />
        </FormField>       
        <TabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.installedOn)}</label>
          <Input     
            readOnly={readonly}             
            value={systemInstalledDate ? AriesDate({unixTimestamp: systemInstalledDate}) : ''}
            type='text' />
        </FormField>  
        <DesktopSeparator/>      
        <FormField>
          <label>{formatMessage(messages.installedIn)}</label>
          <Input   
            readOnly={readonly}               
            value={systemInstalledPlace || ''}
            type='text' />
        </FormField>       
        <TabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.visitNumber)}</label>
          <Input    
            readOnly={readonly}              
            value={visitNumber || ''}
            type='text' />
        </FormField>
        <OnlyTabletSeparator/>
        <FormField>
          <label>{formatMessage(messages.periodicCheck)}</label>
          <Input   
            readOnly={readonly}               
            value={periodicCheck || ''}
            type='text' />
        </FormField>
        <DesktopSeparator/>  
        <FormField>
          <label>{formatMessage(messages.departments)}</label>
          <Input    
            readOnly={readonly}              
            value={systemDepartments || ''}
            type='text' />
        </FormField>
      </FormWrapper>
    </MainContainer>
  )
};

// PropTypes
ChecklistsDetailsGeneralSystem.propTypes = {
  data: PropTypes.shape({
    systemId: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    systemCentral: PropTypes.string,
    systemInstalledDate: PropTypes.number,
    systemInstalledPlace: PropTypes.string,
    visitNumber: PropTypes.number,
    periodicCheck: PropTypes.number,
    systemDepartments: PropTypes.string,
  }),
  intl: PropTypes.object.isRequired,
  editMode: PropTypes.bool,
};

export default injectIntl(ChecklistsDetailsGeneralSystem);