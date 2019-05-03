import React from 'react'

// ======================================================
// Function to return a promise for a component
// that allows a component not to be loaded until the
// first mount
// ======================================================
const asyncComponent = getComponent => class AsyncComponent extends React.Component {
  static Component = null
  state = { Component: AsyncComponent.Component }

  componentDidMount() {
    if (!this.state.Component) {
      getComponent().then((Component) => {
        AsyncComponent.Component = Component
        this.setState({ Component })
      })
    }
  }

  render() {
    const { Component } = this.state
    return Component ? <Component {...this.props} /> : null
  }
}

export default asyncComponent
