import styled, { css } from 'styled-components'
import {media} from './style-utils'


export const PageContentCss = css`
    width: 100%;

  ${media.tablet`
    width: 100%;
  `}
  ${media.desktop`
    max-width: 1280px;
    margin: 0 auto;
  `}
`;

export const PageContent = styled.div`
  ${PageContentCss}
`;

export const FullPageContent = styled.div`
  ${PageContentCss}
  ${media.desktop`
    max-width: initial;
  `}
`;
