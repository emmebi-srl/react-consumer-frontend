import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Input} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {dataShape, optionsShape} from './prop-types'
import {media} from '../../../../../styles'
import monthsUtils from '../../../../../utils/months-utils'


const MainContainer = styled(Form)`
  display: inline-block;
  width: 100%;
`
const FormField = styled(Form.Field)`
  display: inline-block;
  width: 49%!important; 
  ${media.tablet`
    width: 15%!important;
  `}
`

const NotesFormField = styled(FormField)`
  width: 100%!important;
  ${media.tablet`
    width: 32%!important;
  `}
`

const Separator = styled.div`
  display: none;
  width: 2%;
  ${media.tablet`
    display: inline-block;
  `}
`

const PersistentSeparator = styled(Separator)`
  display: inline-block!important;
`

const messages = defineMessages({
  quantity: { id: 'QUANTITY' },
  ampere: { id: 'AMPERE' },
  month: { id: 'MONTH' },
  year: { id: 'YEAR' },
  note: {id: 'NOTE'}
})

const BatteryInfoRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {quantity, ampere, month, year, notes} = data
  const {editMode} = options;

  return (
    <div>
      <MainContainer>
        <FormField>
          <label>{formatMessage(messages.quantity)}</label>
          <Input            
            value={quantity}
            type='number'
            onChange={(_, {value}) => onChange({field: 'quantity', value, type: 'float'})}
            readOnly={!editMode} />
        </FormField>
        <PersistentSeparator/>
        <FormField>
          <label>{formatMessage(messages.ampere)}</label>
          <Input               
            value={ampere}
            type='number'
            onChange={(_, {value}) => onChange({field: 'ampere', value, type: 'float'})}
            readOnly={!editMode} />
        </FormField>
        <Separator/>
        <FormField>
          <label>{formatMessage(messages.month)}</label>
          <Input               
            value={monthsUtils.getMonthName(month)}
            type='text'
            onChange={(_, {value}) => onChange({field: 'month', value, type: 'integer'})}
            readOnly={!editMode} />
        </FormField>
        <PersistentSeparator/>
        <FormField>
          <label>{formatMessage(messages.year)}</label>
          <Input  
            value={year}
            type='number'
            onChange={(_, {value}) => onChange({field: 'year', value, type: 'integer'})}
            readOnly={!editMode} />
        </FormField>
        <Separator/>
        <NotesFormField>
          <label>{formatMessage(messages.note)}</label>
          <Input 
            value={notes}
            fluid
            onChange={(_, {value}) => onChange({field: 'notes', value, type: 'string'})}
            readOnly={!editMode} />
        </NotesFormField>
      </MainContainer>
    </div>
  )
};

// PropTypes
BatteryInfoRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(BatteryInfoRow));