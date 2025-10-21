import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/system';
import {Header} from '../../../../UI'
import {BackgroundVeryLightGrey, ColorDarkGrey, HeaderFontHeight, CardPadding} from '../../../../../styles'

const Container = /* TODO: interpolation requires manual refactor */
styled('div')(() => ({ /* FIXME convert from template */
width: 100%;
  ${BackgroundVeryLightGrey}
  ${CardPadding}
}))

const StyledHeader = /* TODO: interpolation requires manual refactor */
styled(Header)(() => ({ /* FIXME convert from template */
${ColorDarkGrey}
  ${HeaderFontHeight}
}))

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