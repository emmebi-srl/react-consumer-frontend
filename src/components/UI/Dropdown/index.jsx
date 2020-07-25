import React from 'react'
import {Input as SemanticInput} from 'semantic-ui-react'
import styled from 'styled-components'
import { Blue } from '../../../styles'

const StyledInput = styled(SemanticInput)`
  input {
    color: ${Blue}!important;
  }
`

export const Input = ({size, ...rest}) => {
  return (
    <StyledInput {...{...rest, size: size || 'small'}} />
  )
}