import React from 'react';
import { Header, Dimmer, Loader, LocaleNumber } from '../../../UI';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import SearchListContainer from './SearchListContainer';
import { lightGrey } from '../../../../styles';

const Wrapper = styled.div`
  position: relative;
  padding: 10px 20px;
`;

const ListItem = styled.div`
  padding: 16px 0;
  display: inline-block;
  width: 100%;
  border-bottom: solid 1px ${lightGrey};

  &:first-child {
    border-top: solid 1px ${lightGrey};
  }
`;

const ListItemRight = styled.div`
  display: inline-block;
  width: 200px;
  text-align: right;
`;

const ListItemLeft = styled.div`
  float: left;
  width: calc(100% - 200px);
`;

const CompanyName = styled.div`
  font-size: 16px;
  display: inline-block;
  width: 100%;
  margin-bottom: 8px;
`;
const SystemInfo = styled.div`
  font-size: 14px;
  display: inline-block;
  width: 100%;
`;

const Distance = styled.div`
  .value {
    font-weight: 600;
  }
`;

const SearchListView = ({ loading, results }) => {
  return <Wrapper>
    <Header dimension='h3'>
      <FormattedMessage {...messages.resultsList} />
    </Header>
    <Dimmer inverted active={loading}>
      <Loader inverted />
    </Dimmer>
    {
      results[0]
        ? <div>
          {results.map((result) => <ListItem key={result.id}>
            <ListItemLeft>
              <CompanyName>{result.customerId} - {result.companyName}</CompanyName>
              <SystemInfo>{result.systemId} - {result.systemType} - {result.systemDescription}</SystemInfo>
              <SystemInfo>{result.destination.municipality} ({result.destination.province}) - {result.destination.postalCode} -  {result.destination.street} {result.destination.houseNumber}</SystemInfo>
            </ListItemLeft>
            <ListItemRight>
              <Distance>
                <FormattedMessage {...messages.distance} />:
                <span className="value"> <LocaleNumber value={result.distance} radix={2}/>km</span>
              </Distance>
            </ListItemRight>
          </ListItem>)}
        </div>
        : <p><FormattedMessage {...messages.noDataAvailable} /></p>
    }
  </Wrapper>;
};

// PropTypes
SearchListView.propTypes = {
};


export default SearchListContainer(SearchListView);