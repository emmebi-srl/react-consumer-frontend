import React, { Component } from 'react'
import { Search } from 'semantic-ui-react'
import escapeRegExp from 'lodash/escapeRegExp';
import debounce from 'lodash/debounce';


const resultRenderer = ({ title }) => <span>title</span>

export default class SearchRemote extends Component {
  componentWillMount() {
    this.resetComponent()
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => this.setState({ value: result.title })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const re = new RegExp(escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.title)

      this.setState({
        isLoading: false,
        results: [].filter(isMatch),
      })
    }, 300)
  }

  render() {
    const { isLoading, value, results } = this.state

    return (
        <Search
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            resultRenderer={resultRenderer}
            onSearchChange={debounce(this.handleSearchChange, 500, { leading: true })}
            results={results}
            value={value}
            {...this.props}
        />
    )
  }
}