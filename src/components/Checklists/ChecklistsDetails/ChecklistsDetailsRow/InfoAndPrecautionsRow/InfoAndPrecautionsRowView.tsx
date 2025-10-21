import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/system';
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {Form, Checkbox} from '../../../../UI'
import CommonRowWrapper from '../CommonRowWrapper';
import {dataShape, optionsShape} from './prop-types'

const MainContainer = styled(Form)({display: inline-block;
  width: 100%;})

const FormField = styled(Form.Field)({display: block;
  width: 100%;})

const messages = defineMessages({
  checkoutlistPrecautionsText: { id: 'CHECKLIST_PREACUTIONS_TEXT' },
})

const InfoAndPrecautionsRowView = ({intl, data}) => {
  const {formatMessage} = intl
  const {value} = data

  return (
    <div>
      <MainContainer>
        <FormField>
          <Checkbox 
            label={<label>{formatMessage(messages.checkoutlistPrecautionsText)}</label>} 
            checked={value}
            readOnly={true}
          />
        </FormField> 
      </MainContainer>
    </div>
  )
};

// PropTypes
InfoAndPrecautionsRowView.propTypes = {
    data: dataShape, 
    options: optionsShape,
    onChange: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};


export default CommonRowWrapper(injectIntl(InfoAndPrecautionsRowView));