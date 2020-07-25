import React from 'react'
import {Dropdown as SemanticDropdown} from 'semantic-ui-react'
import styled from 'styled-components'
import { Blue } from '../../../styles'

const SyledDropdown = styled(SemanticDropdown)`
  div.text {
    color: ${Blue}!important;
  }
`;

export const Dropdown = ({size, ...rest}) => {
  return (
    <SyledDropdown selection {...{...rest, size: size || 'small'}} />
  )
};