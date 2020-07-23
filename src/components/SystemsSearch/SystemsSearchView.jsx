import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { CardPadding, media } from '../../styles';
import SearchRemote from '../UI/SearchRemote';
import WithAriesProxy from '../../hocs/WithAriesProxy';

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

const ItemWrapper = styled.div`
  position: relative;
`;

const CustomerName = styled.div`
  font-size: 16px;
`;

const OtherInfo = styled.div`
  font-size: 12px;
`;

const SystemsSearchView = ({ ariesProxy }) => {

  const getRemoteData = async (value) => {
    const { systems } = await ariesProxy.systems.search(value);
    return systems;
  };

  return <SearchField>
    <label><FormattedMessage {...messages.system} /></label>
    <SearchRemote className="aries-full"
      getRemoteData={getRemoteData}
      onResultSelect={console.log}
      resultRenderer={(item) => <ItemWrapper>
        <CustomerName>{item.companyName}</CustomerName>
        <OtherInfo>{item.id} - {item.description}</OtherInfo>
        {
          item.destination
            ? <OtherInfo>{item.destination.municipality} ({item.destination.province}) - {item.destination.street}</OtherInfo>
            : null
        }
      </ItemWrapper>}
    ></SearchRemote>
  </SearchField>;
};

export default WithAriesProxy(SystemsSearchView);
