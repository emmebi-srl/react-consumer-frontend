import React from 'react';
import PropTypes from 'prop-types'
import { Input, Form } from '../../../UI';
import styled from 'styled-components';
import { media, FormCard } from '../../../../styles';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../../../UI/PrimaryButton';
import SystemsSearchView from '../../../SystemsSearch';
import SearchFormContainer from './SearchFormContainer';

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

const SearchFormView = ({ searchForm: { address, city, postalCode }, setSystem, setSearchFormValue }) => {

  return (
    <div>      
      <SystemsSearchView onSystemSelect={setSystem}></SystemsSearchView>
      <StyledFormCard>
        <FormField>
          <label><FormattedMessage {...messages.address} /></label>
          <Input readOnly={false}               
            value={address}
            onChange={(e, {value}) => setSearchFormValue('address', value)}
            type='text' />
        </FormField>
        <FormField>
          <label><FormattedMessage {...messages.city} /></label>
          <Input readOnly={false}               
            value={city}
            onChange={(e, {value}) => setSearchFormValue('city', value)}
            type='text' />
        </FormField>
        <FormField>
          <label><FormattedMessage {...messages.cap} /></label>
          <Input readOnly={false}               
            value={postalCode}
            onChange={(e, {value}) => setSearchFormValue('postalCode', value)}
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
  searchForm: PropTypes.shape({
    system: PropTypes.object,
    address: PropTypes.string,
    city: PropTypes.string,
    postalCode: PropTypes.string,
  }).isRequired,
};


export default SearchFormContainer(SearchFormView);