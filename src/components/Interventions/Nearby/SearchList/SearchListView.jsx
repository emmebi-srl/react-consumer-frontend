import React from 'react';
import { Input, Form } from '../../../UI';
import styled from 'styled-components';
import { media, FormCard, CardPadding } from '../../../../styles';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../../../UI/PrimaryButton';

const StyledFormCard = styled(FormCard)`
  display: flex;
  flex-flow: wrap;
`;
const FormField = styled(Form.Field)`
  display: inline-block;
  width: 100%;
  
  ${media.tablet`
    padding: 0px 8px;
    flex: 1;
    align-self: flex-end;
    margin-bottom: 0px!important;
    &:first-child {
      padding-left: 0px;
    }
    &:last-child {
      padding-right: 0px;
    }
  `}

`


const SearchListView = () => {
  return (<div>
      <StyledFormCard>
        <FormField>
          <label><FormattedMessage {...messages.address} /></label>
          <Input readOnly={false}               
            value={''}
            type='text' />
        </FormField>
        <FormField>
          <label><FormattedMessage {...messages.city} /></label>
          <Input readOnly={false}               
            value={''}
            type='text' />
        </FormField>
        <FormField>
          <label><FormattedMessage {...messages.cap} /></label>
          <Input readOnly={false}               
            value={''}
            type='text' />
        </FormField>

        <FormField>
          <PrimaryButton fluid><FormattedMessage {...messages.search}/> </PrimaryButton>
        </FormField>

      </StyledFormCard>  
    </div>
  )
};

// PropTypes
SearchListView.propTypes = {
};


export default SearchListView;