import React from 'react';
import { Input, Form } from '../../../UI';
import styled, {css} from 'styled-components';
import { media, FormCard, CardPadding } from '../../../../styles';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import SearchRemote from '../../../UI/SearchRemote';
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

const SearchField = styled.div`
  ${CardPadding}
  label {
    display: inline-block;
    font-weight: 700;
    margin-right: 25px;
    margin-bottom: 4px;
  }
  .aries-full {
    ${media.tablet`
      display: inline-block;
    `}
    .input {
      width: 100%;
    }
  }
`;

const SearchFormView = () => {
  return (
    <div>      
    <SearchField>
        <label><FormattedMessage {...messages.system} /></label>
        <SearchRemote className="aries-full"></SearchRemote>
    </SearchField>

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
SearchFormView.propTypes = {
};


export default SearchFormView;