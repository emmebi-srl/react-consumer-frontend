import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Radio, Input} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {MASTER_SLAVE_MASTER_VALUE, MASTER_SLAVE_SLAVE_VALUE} from '../consts';
import {dataShape, optionsShape} from './prop-types'
import {media} from '../../../../../styles'


const MainContainer = styled(Form)`
  display: inline-block;
  width: 100%;
`
const FormField = styled(Form.Field)`
  display: block;
  width: 100%;
  ${media.tablet`
    display: inline-block;
    width: 32%;
  `}
`
const Separator = styled.div`
  display: none;
  ${media.tablet`
    display: inline-block;
    width: 2%;
  `}
`

const StyledRadio = styled(Radio)`
  width: 50%;
`

const messages = defineMessages({
  master: { id: 'MASTER' },
  slave: { id: 'SLAVE' },
  slaveId: { id: 'SLAVE_ID' },
  note: {id: 'NOTE'}
})

const MasterSlaveRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {notes, masterSlave, slaveId} = data
  const {editMode} = options

  return (
    <div>
      <MainContainer>
        <FormField>
          <StyledRadio
            label={formatMessage(messages.master)}
            value={MASTER_SLAVE_MASTER_VALUE}
            checked={masterSlave == MASTER_SLAVE_MASTER_VALUE} //eslint-disable-line eqeqeq
            onChange={(_, {value}) => onChange({field: 'masterSlave', value, type: 'radio'})}
            readOnly={!editMode}
          /> 

          <StyledRadio
            label={formatMessage(messages.slave)}
            value={MASTER_SLAVE_SLAVE_VALUE}
            checked={masterSlave == MASTER_SLAVE_SLAVE_VALUE} //eslint-disable-line eqeqeq
            onChange={(_, {value}) => onChange({field: 'masterSlave', value, type: 'radio'})}
            readOnly={!editMode}
          />
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.slaveId)}</label>
          <Input               
            value={slaveId}
            type='text'
            onChange={(_, {value}) => onChange({field: 'slaveId', value, type: 'string'})}
            readOnly={!editMode}
          /> 
        </FormField>
        <Separator/>
        <FormField>
        <label>{formatMessage(messages.note)}</label>
          <Input 
            value={notes}
            fluid
            onChange={(_, {value}) => onChange({field: 'notes', value, type: 'string'})}
            readOnly={!editMode}
          /> 
        </FormField>
      </MainContainer>
    </div>
  )
};

// PropTypes
MasterSlaveRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(MasterSlaveRow));