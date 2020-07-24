import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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

const ResultRender = (props) => <ItemWrapper>
  <CustomerName>{props.companyName}</CustomerName>
  <OtherInfo>{props.id} - {props.description}</OtherInfo>
  {
    props.destination
      ? <OtherInfo>{props.destination.municipality} ({props.destination.province}) - {props.destination.street}</OtherInfo>
      : null
  }
</ItemWrapper>;

class SystemsSearchView extends PureComponent {

  static propTypes = {
    onSystemSelect: PropTypes.func.isRequired,
  }

  handleSystemChange = (system) => this.props.onSystemSelect(system);

  getRemoteData = async (value) => {
    const { ariesProxy } = this.props;
    const { systems } = await ariesProxy.systems.search(value);
    return systems;
  };

  getSelectedDisplayValue = system => `${system.companyName} - ${system.description}`


  render () {
    return <SearchField>
      <label><FormattedMessage {...messages.system} /></label>
      <SearchRemote className="aries-full"
        getRemoteData={this.getRemoteData}
        getSelectedDisplayValue={this.getSelectedDisplayValue}
        onResultSelect={this.handleSystemChange}
        resultRenderer={ResultRender}
      ></SearchRemote>
    </SearchField>;
  }
};

export default WithAriesProxy(SystemsSearchView);
