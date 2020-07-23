import React, { Component } from 'react'
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Search } from 'semantic-ui-react'
import debounce from 'lodash/debounce';

const StyledSearch = styled(Search)`
  .results {
    width: auto!important;
    overflow-y: scroll;
    max-height: 400px;
  }
`;

export default class SearchRemote extends Component {

  static propTypes = {
    getRemoteData: PropTypes.func.isRequired,
    onResultSelect: PropTypes.func.isRequired,
    resultRenderer: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      value: '',
      results: [],
    }
  }

  handleResultSelect = (e, { result }) => {
    this.setState({
      value: result.companyName,
    });
    this.props.onResultSelect(result);
  };

  handleSearchChange = async (e, { value }) => {
    this.setState({ isLoading: true, value })
  
    const results = await this.props.getRemoteData(value);
    this.setState({
      isLoading: false,
      results,
    })
  }

  render() {
    const { isLoading, value, results } = this.state
    const { resultRenderer } = this.props;

    return (
        <StyledSearch loading={isLoading}
            onResultSelect={this.handleResultSelect}
            resultRenderer={resultRenderer}
            onSearchChange={debounce(this.handleSearchChange, 500, { leading: true })}
            results={results}
            value={value}
        />
    )
  }
}