import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {Header} from '../../../../UI'
import {BackgroundVeryLightGrey, ColorDarkGrey, HeaderFontHeight, CardPadding} from '../../../../../styles'

const Container = styled.div`
  width: 100%;
  ${BackgroundVeryLightGrey}
  ${CardPadding}

`

const StyledHeader = styled(Header)`
  ${ColorDarkGrey}
  ${HeaderFontHeight}
`

const HeaderRow = ({data}) => {
  const {header} = data;
  return (
    <Container>
      <StyledHeader text={header} dimension={'h3'} />
    </Container>
  )
};

// PropTypes
HeaderRow.propTypes = {
  data: PropTypes.shape({
    header: PropTypes.string.isRequired
  }),
};

export default HeaderRow;