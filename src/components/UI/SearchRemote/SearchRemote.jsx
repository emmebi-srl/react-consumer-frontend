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

  .icon input {
    width: ${props => props.width};
  }
`;

export default class SearchRemote extends Component {

  static propTypes = {
    getRemoteData: PropTypes.func.isRequired,
    onResultSelect: PropTypes.func.isRequired,
    resultRenderer: PropTypes.func.isRequired,
    getSelectedDisplayValue: PropTypes.func,
    width: PropTypes.string,
  };

  static defaultProps = {
    getSelectedDisplayValue: () => null,
    width: '300px',
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      value: '',
      displayValue: null,
      results: [],
    }
  }

  handleResultSelect = (e, { result }) => {
    const data = result.data;
    const { getSelectedDisplayValue } = this.props;
    const displayValue = getSelectedDisplayValue(data);
    this.setState({
      displayValue,
    });
    this.props.onResultSelect(data);
  };

  handleOnFocusOrMouseDown = (event) => {
    if (event.target instanceof HTMLInputElement) {
      this.setState({ displayValue: null });
    }
  }

  handleValueChange = async (e, { value }) => {
    this.setState({ value })
    await this.handleSearchChange(value);
  }

  handleSearchChange = debounce(async (value) => {
    const { getRemoteData } = this.props;
    this.setState({ isLoading: true, value })
  
    const results = await getRemoteData(value);
    const mappedResults = results.map((data, i) => ({
      data,
      title: `title_${data.id || i}`,
      description: '',
    }))
    this.setState({
      isLoading: false,
      results: mappedResults,
    })
  }, 300)
  

  render() {
    const { isLoading, value, results, displayValue } = this.state
    const { resultRenderer, width } = this.props;

    return (
        <StyledSearch loading={isLoading}
          onFocus={this.handleOnFocusOrMouseDown}
          onMouseDown={this.handleOnFocusOrMouseDown}
          onResultSelect={this.handleResultSelect}
          resultRenderer={({ data }) => resultRenderer(data)}
          onSearchChange={this.handleValueChange}
          results={results}
          width={width}
          value={displayValue || value}
      />
    )
  }
}