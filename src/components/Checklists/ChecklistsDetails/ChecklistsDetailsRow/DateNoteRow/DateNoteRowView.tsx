import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';;
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import { Input, Form } from '../../../../UI';
import CommonRowWrapper from '../CommonRowWrapper';
import {dataShape, optionsShape} from './prop-types';
import { media } from '../../../../../styles';
import { getStringDateByUnixtimestamp } from '../../../../../utils/datetime-utils';


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
  ${media.desktop`
    width: 20%;
  `}
`

const NotesField = /* TODO: interpolation requires manual refactor */
styled(FormField)(() => ({ /* FIXME convert from template */
${media.tablet
}))
    width: 66%;
  `}
  ${media.desktop`
    width: 78%;
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

const messages = defineMessages({
  date: { id: 'DATE' },
  note: { id: 'NOTE' }
})

const DateNoteRow = ({intl, data, onChange, options}) => {
  const {formatMessage} = intl
  const {date, notes} = data
  const {editMode} = options

  return (
    <div>
      <MainContainer>
        <FormField>
          <label>{formatMessage(messages.date)}</label>
          <Input            
            value={getStringDateByUnixtimestamp(date)}
            type='date' 
            onChange={(_, {value}) => onChange({field: 'date', value, type: 'date'})}
            readOnly={!editMode}
          />
        </FormField>
        <Separator/>
        <NotesField>
          <label>{formatMessage(messages.note)}</label>
            <Input 
              value={notes}
              fluid 
              type='text' 
              onChange={(_, {value}) => onChange({field: 'notes', value, type: 'string'})}
              readOnly={!editMode}
            />
        </NotesField>
      </MainContainer>
    </div>
  )
};

// PropTypes
DateNoteRow.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

export default CommonRowWrapper(injectIntl(DateNoteRow));