import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, TextArea} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper'
import {dataShape, optionsShape} from './prop-types'

const NotesContainer = styled(Form)`
  display: inline-block;
  width: 100%;
`
const messages = defineMessages({
  note: {id: 'NOTE'}
})

const NotesRowView = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {notes} = data
  const {editMode} = options


  return (
    <div>
      <NotesContainer>
        <Form.Field>
        <label>{formatMessage(messages.note)}</label>
          <TextArea
            autoHeight 
            value={notes}
            fluid="true"
            onChange={(_, {value}) => onChange({field: 'notes', value, type: 'string'})}
            readOnly={!editMode}
          />
        </Form.Field>
      </NotesContainer>
    </div>
  )
};

// PropTypes
NotesRowView.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(NotesRowView));