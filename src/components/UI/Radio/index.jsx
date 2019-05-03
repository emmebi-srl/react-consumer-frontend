import React from 'react'
import {Radio as SemanticRadio} from 'semantic-ui-react'
import styled from 'styled-components'
import {LightRed, LightGreen} from '../../../styles'

const StyledRadio = styled(SemanticRadio)`
  label::after {
    background-color: ${props => props.positive ? LightGreen : props.negative ? LightRed : null}!important;
  }
`

export const Radio = ({size, ...rest}) => {
  return (
    <StyledRadio {...{...rest, size: size || 'small'}} />
  )
}