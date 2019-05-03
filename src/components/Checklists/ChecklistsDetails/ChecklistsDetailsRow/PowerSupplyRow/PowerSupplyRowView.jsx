import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Input} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
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

const NotesFormField = styled(FormField)`
  width: 100%!important;
  ${media.tablet`
    width: 66%!important;
  `}
`

const Separator = styled.div`
  display: none;
  ${media.tablet`
    display: inline-block;
    width: 2%;
  `}
`

const messages = defineMessages({
  model: { id: 'MODEL' },
  position: { id: 'POSITION' },
  brand: { id: 'BRAND' },
  ampere: { id: 'AMPERE' },
  note: {id: 'NOTE'}
})

const CentralInfoRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {brand, notes, model, position, ampere} = data
  const {editMode} = options

  return (
    <div>
      <MainContainer>
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
        <FormField>
          <label>{formatMessage(messages.ampere)}</label>
          <Input               
            value={ampere}
            type='number'
            onChange={(_, {value}) => onChange({field: 'ampere', value, type: 'float'})}
            readOnly={!editMode}
          />
        </FormField>
        <Separator/>
        <NotesFormField>
        <label>{formatMessage(messages.note)}</label>
          <Input 
            value={notes}
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
CentralInfoRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(CentralInfoRow));