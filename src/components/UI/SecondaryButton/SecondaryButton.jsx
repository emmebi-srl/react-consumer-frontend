import { Component } from 'react'
import { Button } from 'semantic-ui-react'

class SecondaryButtonComponent extends Component {
  render () {
    return <Button {...this.props} secondary> 
      {this.props.text}
    </Button>
  }
}