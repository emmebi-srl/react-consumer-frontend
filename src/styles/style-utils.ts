import { styled, css } from '@mui/system';
import { LightBlue, DarkGrey, CollapsedGrey, VeryLightGrey } from './colors';

export const lightGrey = '#BCBDC1';
export const navbarGrey = '#FAFAFA';

export const ColorDarkGrey = css`
  color: ${DarkGrey}!important;
`;

export const ColorWhite = css`
  color: white !important;
`;

export const HeaderFontHeight = css`
  font-weight: 300 !important;
`;

export const BackgroundGreen = css`
  background-color: #16ab39;
`;

export const BackgroundLightBlue = css`
  background-color: ${LightBlue};
`;

export const BackgroundDarkGrey = css`
  background-color: ${DarkGrey};
`;
export const BackgroundLightGrey = css`
  background-color: ${lightGrey};
`;
export const BackgroundVeryLightGrey = css`
  background-color: ${VeryLightGrey};
`;
export const BackgroundNavbar = css`
  background-color: ${navbarGrey};
`;

const sizes = {
  desktop: 992,
  tablet: 768,
};

// iterate through the sizes and create a media template
export const media = Object.keys(sizes).reduce((accumulator, label) => {
  // use em in breakpoints to work properly cross-browser and support users
  // changing their browsers font-size: https://zellwk.com/blog/media-query-units/
  const emSize = sizes[label] / 16;
  accumulator[label] = (...args) => css`
    @media (min-width: ${emSize}em) {
      ${css(...args)}
    }
  `;
  return accumulator;
}, {});

export const CardPadding = css`
  padding: 10px !important;
  ${media.tablet`
    padding: 10px 20px!important;
  `}
`;

export const Card = styled('div')(() => ({
  ...CardPadding,
}));

export const FormCard = styled(Form)(() => ({
  ...CardPadding,
}));

export const NoMarginTop = css`
  margin-top: 0px !important;
`;

export const NoMarginBottom = css`
  margin-bottom: 0px !important;
`;

export const HeaderH2 = styled('div')<{ collapsable?: boolean }>(({ collapsable }) => ({
  backgroundColor: collapsable ? CollapsedGrey : DarkGrey,
  cursor: collapsable ? 'pointer' : 'initial',
  ...ColorWhite,
  ...CardPadding,
  ...NoMarginBottom,
  ...HeaderFontHeight,
  paddingTop: '18px !important',
  paddingBottom: '18px !important',
  ...NoMarginTop,

  '&:hover': {
    ...BackgroundDarkGrey,
  },
}));

export const CenterVertically = css`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;
export const CenterVerticallyRelative = css`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
`;
