import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/system';
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Input} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {dataShape, optionsShape} from './prop-types'
import {media} from '../../../../../styles'

const MainContainer = styled(Form)({display: inline-block;
  width: 100%;})
const FormField = /* TODO: interpolation requires manual refactor */
styled(Form.Field)(() => ({ /* FIXME convert from template */
display: inline-block;
  width: 49%!important; 
  ${media.tablet
}))
    width: 15%!important;
  `}
`
const Separator = /* TODO: interpolation requires manual refactor */
styled('div')(() => ({ /* FIXME convert from template */
display: none;
  width: 2%;
  ${media.tablet
}))
    display: inline-block;
  `}
`

const PersistentSeparator = styled(Separator)({display: inline-block!important;})

const messages = defineMessages({
  startVoltage: { id: 'START_VOLT' },
  nextVoltage: { id: 'VOLT_AFTER_AN_HOUR' },
  restAbsorption: { id: 'REST_ABSORPTION' },
  alarmAbsorption: { id: 'ABSORPTION_IN_ALARM' },
  hourAutonomy: { id: 'HOUR_AUTONOMY' },
  note: {id: 'NOTE'}
})

const InstrumMeasuresRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {startVoltage, nextVoltage, restAbsorption, alarmAbsorption, hourAutonomy, notes} = data
  const {editMode} = options

  return (
    <div>
      <MainContainer>
        <FormField>
          <label>{formatMessage(messages.startVoltage)}</label>
          <Input            
            value={startVoltage}
            type='number' 
            onChange={(_, {value}) => onChange({field: 'startVoltage', value, type: 'float'})}
            readOnly={!editMode}
          /> 
        </FormField>
        <PersistentSeparator/>
        <FormField>
          <label>{formatMessage(messages.nextVoltage)}</label>
          <Input               
            value={nextVoltage}
            type='number'
            onChange={(_, {value}) => onChange({field: 'nextVoltage', value, type: 'float'})}
            readOnly={!editMode}
          /> 
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.restAbsorption)}</label>
          <Input               
            value={restAbsorption}
            type='number'
            onChange={(_, {value}) => onChange({field: 'restAbsorption', value, type: 'float'})}
            readOnly={!editMode}
          /> 
        </FormField>
        <PersistentSeparator/>
        <FormField>
          <label>{formatMessage(messages.alarmAbsorption)}</label>
          <Input  
            value={alarmAbsorption}
            type='number'
            onChange={(_, {value}) => onChange({field: 'alarmAbsorption', value, type: 'float'})}
            readOnly={!editMode}
          /> 
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.hourAutonomy)}</label>
          <Input  
            value={hourAutonomy}
            type='number'
            onChange={(_, {value}) => onChange({field: 'hourAutonomy', value, type: 'float'})}
            readOnly={!editMode}
          />
        </FormField>
        <PersistentSeparator/>
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
InstrumMeasuresRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(InstrumMeasuresRow));