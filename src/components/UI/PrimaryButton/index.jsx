import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'

class PrimaryButton extends Component {
  render () {
    return <Button {...this.props} primary> 
      {this.props.text || this.props.children}
    </Button>
  }
}

export default PrimaryButton