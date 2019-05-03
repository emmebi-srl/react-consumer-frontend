import React from 'react'
import {TextArea as SemanticTextArea} from 'semantic-ui-react'
import styled from 'styled-components'
import { Blue } from '../../../styles'

const StyledTextArea= styled(SemanticTextArea)`
  color: ${Blue}!important;
`

export const TextArea = ({...rest}) => {
  return (
    <StyledTextArea {...{...rest}} />
  )
}