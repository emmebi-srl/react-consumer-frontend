import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/system';
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Radio, Input} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {SUCTION_SYSTEM_TYPE_HIGH_SENSITIVITY, SUCTION_SYSTEM_TYPE_NORMAL, SUCTION_SYSTEM_TYPE_LASER} from '../consts';
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

const RadioGroupField = /* TODO: interpolation requires manual refactor */
styled(FormField)(() => ({ /* FIXME convert from template */
${media.tablet
}))
    width: 66%;
  `}
`
const NotesFormField = /* TODO: interpolation requires manual refactor */
styled(FormField)(() => ({ /* FIXME convert from template */
${media.tablet
}))
    width: 100%;
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

const StyledRadio = styled(Radio)({width: 33%;})

const messages = defineMessages({
  normal: { id: 'NORMAL' },
  highSensitivity: { id: 'HIGH_SENSITIVITY' },
  laser: { id: 'LASER' },
  model: { id: 'MODEL' },
  position: { id: 'POSITION' },
  brand: { id: 'BRAND' },
  note: {id: 'NOTE'}, 
  sensorNumber: { id: 'SENSOR_NUMBER' },
})

const SuctionSystemRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl;
  const {suctionSystemType, sensorNumber, brand, model, position, notes} = data;
  const {editMode} = options;
  const formattedSuctionSystemType = (suctionSystemType && parseInt(suctionSystemType, 0)) || 0;

  return (
    <div>
      <MainContainer>
        <RadioGroupField>
          <StyledRadio
            label={formatMessage(messages.normal)}
            value={SUCTION_SYSTEM_TYPE_NORMAL}
            checked={formattedSuctionSystemType == SUCTION_SYSTEM_TYPE_NORMAL} //eslint-disable-line eqeqeq
            onChange={(_, {value}) => onChange({field: 'suctionSystemType', value, type: 'radio'})}
            readOnly={!editMode}
          />

          <StyledRadio
            label={formatMessage(messages.highSensitivity)}
            value={SUCTION_SYSTEM_TYPE_HIGH_SENSITIVITY}
            checked={formattedSuctionSystemType == SUCTION_SYSTEM_TYPE_HIGH_SENSITIVITY} //eslint-disable-line eqeqeq
            onChange={(_, {value}) => onChange({field: 'suctionSystemType', value, type: 'radio'})}
            readOnly={!editMode}
          />

          <StyledRadio
            label={formatMessage(messages.laser)}
            value={SUCTION_SYSTEM_TYPE_LASER}
            checked={formattedSuctionSystemType == SUCTION_SYSTEM_TYPE_LASER} //eslint-disable-line eqeqeq
            onChange={(_, {value}) => onChange({field: 'suctionSystemType', value, type: 'radio'})}
            readOnly={!editMode}
          />
        </RadioGroupField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.sensorNumber)}</label>
          <Input            
            value={sensorNumber}
            type='text'
            onChange={(_, {value}) => onChange({field: 'sensorNumber', value, type: 'string'})}
            readOnly={!editMode}
          />
        </FormField>

        <FormField>
          <label>{formatMessage(messages.brand)}</label>
          <Input            
            value={brand}
            type='text'
            onChange={(_, {value}) => onChange({field: 'brand', value, type: 'string'})}
            readOnly={!editMode}
          />
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.model)}</label>
          <Input               
            value={model}
            type='text'
            onChange={(_, {value}) => onChange({field: 'model', value, type: 'string'})}
            readOnly={!editMode}
          />
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.position)}</label>
          <Input               
            value={position}
            type='text' 
            onChange={(_, {value}) => onChange({field: 'position', value, type: 'string'})}
            readOnly={!editMode}
          />
        </FormField>

        <NotesFormField>
          <label>{formatMessage(messages.note)}</label>
          <Input 
            value={notes}
            type='text'
            fluid
            onChange={(_, {value}) => onChange({field: 'notes', value, type: 'string'})}
            readOnly={!editMode}
          />
        </NotesFormField>
      </MainContainer>
    </div>
  )
};

// PropTypes
SuctionSystemRow.propTypes = {
    data: dataShape.isRequired, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(SuctionSystemRow));