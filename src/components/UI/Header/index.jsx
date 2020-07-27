import React from 'react'
import { Header as SemanticHeader } from 'semantic-ui-react'
import styled from 'styled-components';

const StyledHeader = styled(SemanticHeader)`
  font-size: ${props => props.as === 'h3' ? '16px' : props => props.as === 'h2' ? '18px' : undefined}!important;
`

export const Header = ({text, dimension, children, ...rest}) => (
    <StyledHeader {...rest} as={dimension || null}>{text || children || null}</StyledHeader>
)
