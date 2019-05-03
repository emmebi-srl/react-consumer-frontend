import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Input, Radio} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {TOGGLE_CONFIRM_NO_VALUE, TOGGLE_CONFIRM_YES_VALUE, TOGGLE_CONFIRM_NA_VALUE} from '../consts';
import {dataShape, optionsShape} from './prop-types'


const StyledRadio = styled(Radio)`
  margin-right: 5%;
`

const NotesContainer = styled(Form)`
  display: inline-block;
  width: 50%;
`
const Group = styled.div`
  width: 50%;
  display: inline-block;
`

const QuantityContainer = styled(Form)`
  display: inline-block;
  max-width: 40%!important;
  margin-left: 30px;
`
const FormField = styled(Form.Field)`
  display: inline-block;
  width: 40%;
  margin-right: 10%!important;
`
const messages = defineMessages({
  yes: {id: 'YES'},
  no: {id: 'NO'},
  na: {id: 'NA'}, 
  quantity: {id: 'QUANTITY'}, 
  tested: {id: 'TESTED_N'},
  note: {id: 'NOTE'}
})

const ToggleConfirmRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {value, notes, quantity, tested} = data
  const {hasNa, hasQuantity, editMode} = options

  return (
    <div>
      <Group>
        <StyledRadio
          positive='true'
          label={formatMessage(messages.yes)}
          value={TOGGLE_CONFIRM_YES_VALUE}
          checked={value == TOGGLE_CONFIRM_YES_VALUE} //eslint-disable-line eqeqeq
          onChange={(_, {value}) => onChange({field: 'value', value, type: 'radio'})}
          readOnly={!editMode}
        />
        <StyledRadio
          negative='false'
          label={formatMessage(messages.no)}
          value={TOGGLE_CONFIRM_NO_VALUE}
          checked={value == TOGGLE_CONFIRM_NO_VALUE} //eslint-disable-line eqeqeq
          onChange={(_, {value}) => onChange({field: 'value', value, type: 'radio'})}
          readOnly={!editMode}
        />
        {hasNa === true ?         
          <StyledRadio
            label={formatMessage(messages.na)}
            value={TOGGLE_CONFIRM_NA_VALUE}
            checked={value == TOGGLE_CONFIRM_NA_VALUE} //eslint-disable-line eqeqeq
            onChange={(_, {value}) => onChange({field: 'value', value, type: 'radio'})}
            readOnly={!editMode}
          />
        : null}
        {hasQuantity === true ?         
          <QuantityContainer>
            <FormField>
              <label>{formatMessage(messages.quantity)}</label>
              <Input            
                value={quantity}
                type='number'
                onChange={(_, {value}) => onChange({field: 'quantity', value, type: 'integer'})}
                readOnly={!editMode}
              />
            </FormField>
            <FormField>
              <label>{formatMessage(messages.tested)}</label>
              <Input               
                value={tested}
                type='number'
                onChange={(_, {value}) => onChange({field: 'tested', value, type: 'integer'})}
                readOnly={!editMode}
              />
            </FormField>
          </QuantityContainer>
        : null}
      </Group>
      <NotesContainer>
        <Form.Field>
        <label>{formatMessage(messages.note)}</label>
          <Input 
            value={notes}
            fluid
            type='text'
            onChange={(_, {value}) => onChange({field: 'notes', value, type: 'string'})}
            readOnly={!editMode}
          />
        </Form.Field>
      </NotesContainer>
    </div>
  )
};

// PropTypes
ToggleConfirmRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(ToggleConfirmRow));