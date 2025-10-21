import { styled, css } from '@mui/system';

export const PageContentCss = css`
  width: 100%;
`;

export const PageContent = styled('div')(() => ({
  ...PageContentCss,
}));

const FullPageContentCss = css`
  ${PageContentCss}
  @media (min-width: 64em) {
    max-width: initial;
  }
`;

export const FullPageContent = styled('div')(() => ({
  ...FullPageContentCss,
}));
