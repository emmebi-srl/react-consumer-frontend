import styled, { css } from 'styled-components'
import {media} from './style-utils'


export const PageContentCss = css`
    width: 100%;
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
