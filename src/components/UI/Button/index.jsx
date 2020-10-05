import React from 'react'
import {Button as SemanticButton} from 'semantic-ui-react'

const MyButton = ({...rest}) => {
  return (
    <SemanticButton {...rest} />
  )
}

MyButton.Content = SemanticButton.Content
MyButton.Group = SemanticButton.Group

export const Button = MyButton;