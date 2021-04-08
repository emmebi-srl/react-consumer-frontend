import {Button as SemanticButton} from 'semantic-ui-react'

const MyButton = SemanticButton;
MyButton.Content = SemanticButton.Content
MyButton.Group = SemanticButton.Group

export const Button = MyButton;