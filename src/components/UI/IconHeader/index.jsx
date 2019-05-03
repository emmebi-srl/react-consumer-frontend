import React from 'react'
import { Header, Icon } from 'semantic-ui-react'

const IconHeader = ({text, image, dimension}) => (
  <Header as={dimension || 'h2'}>
    <Icon name={name} circular />
    <Header.Content>
      {text}
    </Header.Content>
  </Header>
)

export default IconHeader
