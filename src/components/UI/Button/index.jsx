import React from 'react'
import {Button as SemanticButton} from 'semantic-ui-react'

const MyButton = ({...rest}) => {
  return (
    <SemanticButton {...rest} />
  )
}

MyButton.Content = SemanticButton.Content

export const Button = MyButton;