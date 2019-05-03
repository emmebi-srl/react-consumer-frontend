import React, { Component } from 'react'

const withFetching = asyncAction => Comp => class WithFetching extends Component {
  state = {
    error: null,
    response: {},
    isLoading: false,
  }
  async componentDidMount() {
    this.setState({ isLoading: true }) 
    try{
      const response = await asyncAction()
      this.setState({ response })
    }
    catch (error){
      this.setState({ error })
    }
    this.setState({ isLoading: false })
  }
  render() {
    return <Comp {...this.props} {...this.state} />
  }
}
export default withFetching