import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/system';
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Radio, Input} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {MASTER_SLAVE_MASTER_VALUE, MASTER_SLAVE_SLAVE_VALUE} from '../consts';
import {dataShape, optionsShape} from './prop-types'
import {media} from '../../../../../styles'


const MainContainer = styled(Form)({display: inline-block;
  width: 100%;})
const FormField = /* TODO: interpolation requires manual refactor */
styled(Form.Field)(() => ({ /* FIXME convert from template */
display: block;
  width: 100%;
  ${media.tablet
}))
    display: inline-block;
    width: 32%;
  `}
`
const Separator = /* TODO: interpolation requires manual refactor */
styled('div')(() => ({ /* FIXME convert from template */
display: none;
  ${media.tablet
}))
    display: inline-block;
    width: 2%;
  `}
`

const StyledRadio = styled(Radio)({width: 50%;})

const messages = defineMessages({
  model: { id: 'MODEL' },
  position: { id: 'POSITION' },
  brand: { id: 'BRAND' },
  master: { id: 'MASTER' },
  slave: { id: 'SLAVE' },
  slaveId: { id: 'SLAVE_ID' },
  note: {id: 'NOTE'}
})

const CentralInfoRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {brand, notes, model, position, masterSlave, slaveId} = data
  const {editMode} = options;

  return (
    <div>
      <MainContainer>
        <FormField>
          <label>{formatMessage(messages.brand)}</label>
          <Input            
            value={brand}
            type='text'            
            onChange={(_, {value}) => onChange({field: 'brand', value, type: 'string'})}
            readOnly={!editMode} />
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.model)}</label>
          <Input               
            value={model}
            type='text'
            onChange={(_, {value}) => onChange({field: 'model', value, type: 'string'})}
            readOnly={!editMode} />
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.position)}</label>
          <Input               
            value={position}
            type='text'
            onChange={(_, {value}) => onChange({field: 'position', value, type: 'string'})}
            readOnly={!editMode} />
        </FormField>

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
            type='text' />
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
CentralInfoRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(CentralInfoRow));